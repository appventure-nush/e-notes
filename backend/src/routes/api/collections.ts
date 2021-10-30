import {Router} from 'express';

import notesRouter from './notes';
import {
    checkAdmin,
    checkPermissions,
    checkUser,
    checkUserOptional, difference,
    getAvailableCollections,
    getCollection, getNotes,
    hasPermissions
} from '../../utils';
import {makeColl} from "../../types/coll";
import {firestore, storage} from "firebase-admin";
import path from "path";
import imageType from "image-type";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import notes from "./notes";
import WriteResult = firestore.WriteResult;

const collections = Router();

const IMAGE_FORMATS = ['image/gif', 'image/jpeg', 'image/png'];
const LOCAL_IMAGE_CACHE = new Map<string, [any, number]>();
const URL_CACHE_AGE = 3600000;

export async function getURL(name: string) {
    if (LOCAL_IMAGE_CACHE.has(name)) {
        const cache = LOCAL_IMAGE_CACHE.get(name);
        if (cache[1] > Date.now()) return cache[0];
    }
    const url = (await storage().bucket().file(name).getSignedUrl({
        action: 'read',
        expires: Date.now() + URL_CACHE_AGE
    }))[0];
    LOCAL_IMAGE_CACHE.set(name, [url, Date.now() + URL_CACHE_AGE]); // 1 minute file url expiration
    return url;
}

collections.get("/", checkUser, (req, res) => res.json(getAvailableCollections(req.body.cuid)));
collections.post("/", checkAdmin, (req, res) => res.status(400).json({reason: "collection_id_required"}));

collections.get("/:cid", checkPermissions, async (req, res) => {
    const collection = getCollection(req.params.cid);

    if (!collection) return res.status(404).json({
        reason: "collection_not_found",
        cid: req.params.cid
    })
    else res.json(collection);
});
collections.post("/:cid", checkAdmin, async (req, res) => {
    let collection = getCollection(req.params.cid);
    let old = {...collection};
    if (collection) {
        if (req.body.action && req.body.action === "add") return res.status(400).json({reason: "collection_already_exist"});
        if (req.body.name) collection.name = req.body.name;
        if (req.body.desc) collection.desc = req.body.desc;
        if (req.body.open) collection.open = (req.body.open === "open");
        await addAudit(simpleAudit(req.body.cuid, req.params.cid, Category.COLLECTION, Action.EDIT, difference(old, collection)));
    } else {
        collection = makeColl(req.params.cid, req.body.cuid, req.body.name, req.body.desc, req.body.open);
        await addAudit(simpleAudit(req.body.cuid, req.params.cid, Category.COLLECTION, Action.CREATE, [collection]));
    }
    await firestore().collection("collections").doc(req.params.cid).set(collection);
    res.json(collection);
});
collections.delete("/:cid", checkAdmin, async (req, res) => {
    const collection = getCollection(req.params.cid);
    if (!collection) return res.status(404).json({
        reason: "collection_not_found",
        cid: req.params.cid
    }); else {
        await firestore().collection("collections").doc(req.params.cid).delete();
        res.json({status: "ok"});
        await addAudit(simpleAudit(req.body.cuid, req.params.cid, Category.COLLECTION, Action.DELETE, [collection]));
    }
});

collections.get('/:cid/img', checkUserOptional, async (req, res) => {
    if (!getCollection(req.params.cid)) return res.json({status: 'failed', reason: 'collection_not_found'});
    if (!await hasPermissions(req.body.cuid, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    const files = (await storage().bucket().getFiles({
        directory: `collections/${req.params.cid}/images/`
    }))[0].filter(file => file.name !== `collections/${req.params.cid}/images/`);
    res.json(await Promise.all(files.map(async file => ({
        name: path.basename(file.name),
        url: await getURL(file.name)
    }))));
});
collections.post('/:cid/img', checkAdmin, async (req, res) => { // called for every file
    if (!getCollection(req.params.cid)) return res.json({status: 'failed', reason: 'collection_not_found'});
    if (!req.files) return res.json({status: 'failed', reason: 'where is the file'});
    const payload = req.files.payload;
    if (payload && "data" in payload) {
        const type = imageType(payload.data);
        if (type && type.mime.toUpperCase() === payload.mimetype.toUpperCase()) {
            if (IMAGE_FORMATS.includes(type.mime.toLowerCase())) {
                try {
                    const file = storage().bucket().file(`collections/${req.params.cid}/images/${req.body.name}`);
                    await file.save(payload.data, {resumable: false});
                    res.json({
                        status: 'success',
                        url: await getURL(`collections/${req.params.cid}/images/${req.body.name}`)
                    });
                    await addAudit(simpleAudit(req.body.cuid, req.params.cid, Category.COLLECTION, Action.UPLOAD_FILE, [file.name]));
                } catch (e) {
                    // await error("image upload error", {
                    //     message: e.message,
                    //     body: req.body,
                    //     type
                    // });
                    res.json({status: 'failed', reason: 'please contact an admin'});
                }
            } else return res.json({status: 'failed', reason: 'only gif/jpg/png allowed!'});
        } else return res.json({status: 'failed', reason: 'i like your funny words, magic man'});
    } else return res.json({status: 'failed', reason: 'where is the file'});
});
collections.delete('/:cid/img/:img', checkAdmin, async (req, res) => {
    if (!getCollection(req.params.cid)) return res.json({status: 'failed', reason: 'collection_not_found'});
    const file = storage().bucket().file(`collections/${req.params.cid}/images/${req.params.img}`);
    file.delete()
        .then(() => res.json({status: 'success'}))
        .catch(e => res.json({status: 'failed', reason: 'please contact an admin', error: e.message}));
    await addAudit(simpleAudit(req.body.cuid, req.params.cid, Category.COLLECTION, Action.DELETE_FILE, [file.name]));
});

collections.use("/:cid/notes", checkPermissions, (req, res, next) => {
    req.body.cid = req.params.cid;
    const collection = getCollection(req.params.cid);
    if (!collection) return res.status(404).json({reason: "collection_not_found"});
    next();
}, notesRouter);

collections.post("/:cid/reorder", checkAdmin, async (req, res) => {
    let tasks: Promise<WriteResult>[] = [];
    let notes = await getNotes(req.params.cid);
    for (let nid of Object.keys(req.body)) {
        let note = notes.find(n => n.nid === nid);
        if (!note) continue;
        if (!Number.isSafeInteger(req.body[nid])) continue;
        if (req.body[nid] < 0 || req.body[nid] >= notes.length) continue;
        note.index = req.body[nid];
    }
    notes = notes.sort((a, b) => a.index - b.index);
    notes.forEach((n, i) => {
        if (n.index !== i || req.body.hasOwnProperty(n.nid)) {
            n.index = i;
            tasks.push(firestore().collection("collections").doc(req.params.cid).collection("notes").doc(n.nid).set(n));
        }
    })
    await Promise.all(tasks);
    let newMap: { [nid: string]: number } = {};
    notes.forEach(n => newMap[n.nid] = n.index);
    res.json({
        status: 'success',
        order: newMap
    });
});

export default collections;