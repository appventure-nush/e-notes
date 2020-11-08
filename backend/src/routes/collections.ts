import {Router} from 'express';

import notesRouter from './notes';

const collections = Router();

import {checkPermissions, checkAdmin} from '../utils';
import Collection from "../types/coll";

collections.get("/", async (req, res, next) => {
    const snapshot = await req.app.locals.db.collection("collections").limi.get();
    if (snapshot.empty) return res.status(404).json({
        reason: "no_collections_found"
    })
    else res.json(snapshot.docs.map((doc: { id: any; }) => doc.id));
});

collections.get("/:cid", checkPermissions, async (req, res, next) => {
    const doc = await req.app.locals.db.collection("collections").doc(req.params.cid).get();

    if (!doc.exists) return res.status(404).json({
        reason: "collection_not_found",
        cid: req.params.cid
    })
    else res.json(doc.data());
});

collections.delete("/:cid", checkAdmin, async (req, res, next) => {
    const ref = req.app.locals.db.collection("collections").doc(req.params.cid);

    if (!(await ref.get()).exists) return res.status(404).json({
        reason: "collection_not_found",
        cid: req.params.cid
    });
    else {
        await ref.delete();
        res.json({status: "ok"});
    }
});

collections.post("/:cid", checkAdmin, async (req, res, next) => {
    const collection = new Collection(req.params.cid, req.body.name, req.body.desc);
    const ref = req.app.locals.db.collection("collections").doc(req.params.cid);
    if ((await ref.get()).exists) return res.status(403).json({
        reason: "collection_already_exists",
        cid: req.params.cid
    });
    else {
        await ref.set(collection.toData());
        res.json(collection);
    }
});

collections.use("/:cid/notes", checkPermissions, (req, res, next) => {
    req.body.cid = req.params.cid;
    next();
}, notesRouter);

export default collections;