import {Router} from 'express';

import notesRouter from './notes';
import {
    checkCreatePermissions, checkEditPermissions,
    checkPermissions,
    checkUser,
    difference, getAllRoles,
    getAvailableCollections,
    getCollection, getNotes
} from '../../utils';
import {makeColl} from "../../types/coll";
import {auth, firestore, storage} from "firebase-admin";
import imageType from "image-type";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import WriteResult = firestore.WriteResult;
import {error, failed, success} from "../../response";
import {_rejects} from "../../types/permissions";
import {roleAccepts} from "../../types/role";

const collections = Router();

const IMAGE_FORMATS = ['image/gif', 'image/jpeg', 'image/png'];

collections.get("/", checkUser, async (req, res) => {
    return res.json(await getAvailableCollections(req.uid!));
});
collections.post("/", checkUser, (req, res) => res.json(failed("collection_id_required")));
collections.get("/:cid", checkUser, checkPermissions, async (req, res) => {
    const collection = getCollection(req.params.cid);
    if (!collection) return res.json(failed({
        reason: "collection_not_found",
        cid: req.params.cid
    }))
    else res.json(collection);
});
collections.post("/:cid", checkUser, async (req, res) => {
    let collection = getCollection(req.params.cid);
    let old = {...collection};
    if (req.body.action === "edit") {
        if (!await checkEditPermissions(req)) return res.json(failed("not_authorised"));
        if (!collection) return res.json(failed("collection_does_not_exist"));
        if (req.body.hasOwnProperty("name")) collection.name = req.body.name;
        if (req.body.hasOwnProperty("desc")) collection.desc = req.body.desc;
        if (req.body.hasOwnProperty("open")) collection.open = Boolean(req.body.open);
        await addAudit(simpleAudit(req.uid!, req.params.cid, Category.COLLECTION, Action.EDIT, difference(old, collection)));
        await firestore().collection("collections").doc(req.params.cid).update(collection);
    } else if (req.body.action === "add") {
        if (!await checkCreatePermissions(req)) return res.json(failed("not_authorised"));
        if (collection) return res.json(failed("collection_already_exist"));
        collection = makeColl(req.params.cid, req.uid!, req.body.name, req.body.desc, req.body.open);
        await addAudit(simpleAudit(req.uid!, req.params.cid, Category.COLLECTION, Action.CREATE, [collection]));
        await firestore().collection("collections").doc(req.params.cid).set(collection);
    } else {
        return res.json(failed("ZW5vdGVze04wVF80X0ZMNDl9"));
    }
    res.json(success({collection}));
});
collections.post("/:cid/access", checkUser, async (req, res) => {
    let collection = getCollection(req.params.cid);
    if (!collection) return res.json(failed("collection_does_not_exist"));
    if (!await checkEditPermissions(req)) return res.json(failed("not_authorised"));
    collection.hasReadAccess = collection?.hasReadAccess || [];
    if (Array.isArray(req.body.emails)) {
        let users: (auth.UserRecord | undefined)[] = await Promise.all(req.body.emails.map((email: string) => auth().getUserByEmail(email)));
        collection.hasReadAccess.push(...(users.filter(u => u && !collection?.hasReadAccess.includes(u.uid)) as auth.UserRecord[]).map(u => u.uid));
    }
    await firestore().collection("collections").doc(req.params.cid).update(collection);
    res.json(success({collection}));
});
collections.delete("/:cid/access", checkUser, async (req, res) => {
    let collection = getCollection(req.params.cid);
    if (!collection) return res.json(failed("collection_does_not_exist"));
    if (!await checkEditPermissions(req)) return res.json(failed("not_authorised"));
    collection.hasReadAccess = [];
    await firestore().collection("collections").doc(req.params.cid).update(collection);
    res.json(success({collection}));
});
collections.delete("/:cid", checkUser, async (req, res) => {
    if (!await checkEditPermissions(req)) return res.json(failed("not_authorised"));
    const collection = getCollection(req.params.cid);
    if (!collection) return res.json(failed({
        reason: "collection_not_found",
        cid: req.params.cid
    })); else {
        await firestore().collection("collections").doc(req.params.cid).delete();
        res.json(success());
        await addAudit(simpleAudit(req.uid!, req.params.cid, Category.COLLECTION, Action.DELETE, [collection]));
    }
});
collections.get('/:cid/img', checkUser, checkPermissions, async (req, res) => {
    if (!getCollection(req.params.cid)) return res.json(failed('collection_not_found'));
    const files = (await storage().bucket().getFiles({prefix: `collections/${req.params.cid}/images`}))[0];
    res.json(files.map(f => ({
        url: f.publicUrl(),
        name: f.name.substring(f.name.lastIndexOf('/') + 1)
    })).filter(i => i.name));
});
collections.post('/:cid/img', checkUser, async (req, res) => {
    if (!await checkEditPermissions(req)) return res.json(failed("not_authorised"));
    if (!getCollection(req.params.cid)) return res.json(failed('collection_not_found'));
    if (!req.files) return res.json(failed('where is the file'));
    const payload = req.files.file;
    if (payload && "data" in payload) {
        const type = imageType(payload.data);
        if (type && type.mime.toUpperCase() === payload.mimetype.toUpperCase()) {
            if (IMAGE_FORMATS.includes(type.mime.toLowerCase())) {
                try {
                    const file = storage().bucket().file(`collections/${req.params.cid}/images/${payload.name}`);
                    await file.save(payload.data, {public: true, resumable: false});
                    res.json(success({
                        name: payload.name,
                        url: file.publicUrl()
                    }));
                    await addAudit(simpleAudit(req.uid!, req.params.cid, Category.COLLECTION, Action.UPLOAD_FILE, [file.name]));
                } catch (e) {
                    res.json(failed('please contact an admin'));
                }
            } else return res.json(failed('only gif/jpg/png allowed!'));
        } else return res.json(failed('i like your funny words, magic man'));
    } else return res.json(failed('where is the file'));
});
collections.delete('/:cid/img/:img', checkUser, async (req, res) => {
    if (!await checkEditPermissions(req)) return res.json(failed("not_authorised"));
    if (!getCollection(req.params.cid)) return res.json(failed('collection_not_found'));
    const file = storage().bucket().file(`collections/${req.params.cid}/images/${req.params.img}`);
    file.delete()
        .then(() => res.json(success()))
        .catch(e => res.json(error(e.message)));
    await addAudit(simpleAudit(req.uid!, req.params.cid, Category.COLLECTION, Action.DELETE_FILE, [file.name]));
});
collections.use("/:cid/notes", checkUser, checkPermissions, (req, res, next) => {
    req.body.cid = req.params.cid;
    const collection = getCollection(req.params.cid);
    if (!collection) return res.json({reason: "collection_not_found"});
    next();
}, notesRouter);
collections.get("/:cid/roles", checkUser, checkPermissions, (req, res) => res.json(getAllRoles().filter(role => roleAccepts(role, req.params.cid) && !_rejects(role, req.params.cid))))
collections.post("/:cid/reorder", checkUser, async (req, res) => {
    if (!await checkEditPermissions(req)) return res.json(failed("not_authorised"));
    let tasks: Promise<WriteResult>[] = [];
    let notes = await getNotes(req.params.cid);
    if (!notes) return res.json(error("notes_not_found"));
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
    res.json(success({
        notes: notes
    }));
});

export default collections;