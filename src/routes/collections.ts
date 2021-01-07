import {Router} from 'express';
import {checkAdmin, checkUserOptional, getCollection, getNote, hasPermissions, transformUser} from "../utils";
import imageType from "image-type";
import {storage} from "firebase-admin";
import {error} from "../logger";
import path from "path";

const collection = Router();
const IMAGE_FORMATS = ['image/gif', 'image/jpeg', 'image/png'];
const LOCAL_IMAGE_CACHE = new Map<string, [any, number]>();
const URL_CACHE_AGE = 3600000;

async function getURL(name: string) {
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

collection.get('/', checkUserOptional, (req, res) => {
    res.redirect('/');
});
collection.get('/:cid', checkUserOptional, async (req, res) => {
    if (req.originalUrl.endsWith(req.params.cid)) return res.redirect(`/c/${req.params.cid}/`); // force '/'
    else {
        const hasPerm = await hasPermissions(req.body.cuid, req.params.cid);
        const coll = getCollection(req.params.cid);
        if (hasPerm && coll) {
            res.render("collection", {
                title: req.params.cid + "/" + coll.name,
                user: req.body.user,
                coll,
                csrf: req.csrfToken()
            });
        } else res.redirect('/');
    }
});
collection.get('/:cid/img', checkUserOptional, async (req, res) => {
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
collection.get('/:cid/img/:img', checkUserOptional, async (req, res) => {
    if (!getCollection(req.params.cid)) return res.json({status: 'failed', reason: 'collection_not_found'});
    if (!await hasPermissions(req.body.cuid, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    res.redirect(await getURL(`collections/${req.params.cid}/images/${req.params.img}`));
});
collection.delete('/:cid/img/:img', checkAdmin, (req, res) => {
    if (!getCollection(req.params.cid)) return res.json({status: 'failed', reason: 'collection_not_found'});
    const file = storage().bucket().file(`collections/${req.params.cid}/images/${req.params.img}`);
    file.delete()
        .then(() => res.json({status: 'success'}))
        .catch(e => res.json({status: 'failed', reason: 'please contact an admin', error: e.message}));
});
collection.post('/:cid/img', checkAdmin, async (req, res) => { // called for every file
    if (!getCollection(req.params.cid)) return res.json({status: 'failed', reason: 'collection_not_found'});
    if (!req.files) return res.json({status: 'failed', reason: 'where is the file'});
    const payload = req.files.payload;
    if (payload && "data" in payload) {
        const type = imageType(payload.data);
        if (type && type.mime.toUpperCase() === payload.mimetype.toUpperCase()) {
            if (IMAGE_FORMATS.includes(type.mime.toLowerCase())) {
                try {
                    const file = storage().bucket().file(`collections/${req.params.cid}/images/${req.body.name}`);
                    await file.save(new Uint8Array(payload.data), {resumable: false});
                    res.json({
                        status: 'success',
                        url: await getURL(`collections/${req.params.cid}/images/${req.body.name}`)
                    });
                } catch (e) {
                    await error("image upload error", {
                        message: e.message,
                        body: req.body,
                        type
                    });
                    res.json({status: 'failed', reason: 'please contact an admin'});
                }
            } else return res.json({status: 'failed', reason: 'only gif/jpg/png allowed!'});
        } else return res.json({status: 'failed', reason: 'i like your funny words, magic man'});
    } else return res.json({status: 'failed', reason: 'where is the file'});
});
collection.get('/:cid/:nid', checkUserOptional, (req, res) => {
    res.render("collection", {
        title: req.params.cid + "/" + req.params.nid,
        user: req.body.user,
        coll: getCollection(req.params.cid),
        nid: req.params.nid,
        csrf: req.csrfToken(),
    });
});
collection.get('/edit/:cid/:nid', checkUserOptional, async (req, res) => {
    let note = await getNote(req.params.cid, req.params.nid);
    if (!note) res.redirect('/c/' + req.params.cid);
    else res.render("editor", {
        title: "Editing " + req.params.nid,
        user: req.body.user,
        coll: getCollection(req.params.cid),
        note: note,
        csrf: req.csrfToken(),
    });
});

export default collection;