import express, {Router} from "express";
import {checkUser, getCollection, hasPermissions} from "../utils";
import {storage} from "firebase-admin";

const collection = Router();

async function imageHandler(req: express.Request, res: express.Response) {
    if (!getCollection(req.params.cid)) return res.json({status: 'failed', reason: 'collection_not_found'});
    if (!await hasPermissions(req.uid, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    res.redirect(storage().bucket().file(`collections/${req.params.cid}/images/${req.params.file}`).publicUrl());
}

collection.get("/:cid/images/:file", checkUser, imageHandler);
collection.get('/:cid/img/:file', checkUser, imageHandler);
collection.get("/:cid/:nid/images/:file", checkUser, imageHandler);

export default collection;