import express, {Router} from "express";
import {checkUser, checkUserOptional} from "../utils";
import {imageHandler} from "./raw";

const collection = Router();

const IMAGE_REGEX = /^[^/]+\.(png|jpg|gif|bmp|jpeg|webp)$/i;

function optionalImageHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.uid) next()
    else if (req.accepts("image/*") && IMAGE_REGEX.test(req.params.file)) return imageHandler(req, res);
    else next();
}

collection.get("/:cid/:file", checkUserOptional, optionalImageHandler);
collection.get("/:cid/images/:file", checkUser, optionalImageHandler);
collection.get('/:cid/img/:file', checkUser, optionalImageHandler);

collection.get("/:cid/:nid/:file", checkUserOptional, optionalImageHandler);
collection.get("/:cid/:nid/images/:file", checkUser, imageHandler);
collection.get("/:cid/:nid/img/:file", checkUser, imageHandler);

export default collection;