import {Router} from 'express';

import notesRouter from './notes';

const collections = Router();

import {getAvailableCollections, checkUser, checkPermissions, checkAdmin} from '../../utils';
import Collection from "../../types/coll";
import {firestore} from "firebase-admin";

collections.get("/", checkUser, async (req, res) => {
    const collections = await getAvailableCollections(req.body.cuid);
    if (collections.length === 0) return res.status(404).json({
        reason: "no_collections_found"
    });
    else res.json(collections);
});

collections.get("/:cid", checkPermissions, async (req, res) => {
    const doc = await firestore().collection("collections").doc(req.params.cid).get();

    if (!doc.exists) return res.status(404).json({
        reason: "collection_not_found",
        cid: req.params.cid
    })
    else res.json(doc.data());
});

collections.delete("/:cid", checkAdmin, async (req, res) => {
    const ref = firestore().collection("collections").doc(req.params.cid);

    if (!(await ref.get()).exists) return res.status(404).json({
        reason: "collection_not_found",
        cid: req.params.cid
    });
    else {
        await ref.delete();
        res.json({status: "ok"});
    }
});

collections.post("/:cid", checkAdmin, async (req, res) => {
    const collection = new Collection(req.params.cid, req.body.name, req.body.desc);
    const ref = firestore().collection("collections").doc(req.params.cid);
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