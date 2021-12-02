import express, {Router} from "express";
import {checkUser, collectionCache, hasPermissions} from "../utils";
import {storage} from "firebase-admin";

const collection = Router();

async function imageHandler(req: express.Request, res: express.Response) {
    if (!collectionCache.has(req.params.cid)) return res.json({status: 'failed', reason: 'collection_not_found'});
    if (!await hasPermissions(req.uid!, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    res.redirect(storage().bucket().file(`collections/${req.params.cid}/images/${req.params.file?.toLowerCase()}`).publicUrl());
}

const IMAGE_REGEX = /^[^/]+\.(png|jpg|gif|bmp|jpeg|webp)$/i;

function optionalImageHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.accepts("image/*") && IMAGE_REGEX.test(req.params.file)) return imageHandler(req, res);
    else next();
}


collection.get("/:cid/:file", checkUser, optionalImageHandler);
collection.get("/:cid/images/:file", checkUser, imageHandler);
collection.get('/:cid/img/:file', checkUser, imageHandler);

collection.get("/:cid/:nid/:file", checkUser, optionalImageHandler);
collection.get("/:cid/:nid/images/:file", checkUser, imageHandler);
collection.get("/:cid/:nid/img/:file", checkUser, imageHandler);


export default collection;