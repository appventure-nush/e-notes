import {Router} from 'express';
import {checkUserOptional, getCollection, getNote, hasPermissions} from "../utils";
import collections, {getURL} from "./api/collections";

const collection = Router();

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
collections.get('/:cid/img/:img', checkUserOptional, async (req, res) => {
    if (!getCollection(req.params.cid)) return res.json({status: 'failed', reason: 'collection_not_found'});
    if (!await hasPermissions(req.body.cuid, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    res.redirect(await getURL(`collections/${req.params.cid}/images/${req.params.img}`));
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
collection.get('/:cid/:nid/edit', checkUserOptional, async (req, res) => {
    const note = await getNote(req.params.cid, req.params.nid);
    if (!note) res.redirect('/c/' + req.params.cid);
    else res.render("editor", {
        title: "Editing " + req.params.nid,
        user: req.body.user,
        coll: getCollection(req.params.cid),
        note,
        csrf: req.csrfToken(),
    });
});

export default collection;