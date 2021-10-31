import express, {Router} from "express";
import {checkUser, getCollection, hasPermissions} from "../utils";
import {getURL} from "./api/collections";

const collection = Router();

async function imageHandler(req: express.Request, res: express.Response) {
    if (!getCollection(req.params.cid)) return res.json({status: 'failed', reason: 'collection_not_found'});
    if (!await hasPermissions(req.uid, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    res.redirect(await getURL(`collections/${req.params.cid}/images/${req.params.file}`));
}

collection.get("/:cid/images/:file", checkUser, imageHandler);
collection.get('/:cid/img/:img', checkUser, imageHandler);
export default collection;