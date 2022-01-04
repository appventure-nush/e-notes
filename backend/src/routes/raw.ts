import express, {Router} from "express";
import {checkUser, hasPermissions} from "../utils";
import {COLLECTION_IMAGE_STORE, COLLECTION_NOTES_STORE} from "../storage";
import {COLLECTION_IMAGE_PATH, COLLECTION_NOTE_PATH} from "./api/collections";

export async function imageHandler(req: express.Request, res: express.Response) {
    if (!await hasPermissions(req.uid!, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    const r = COLLECTION_IMAGE_STORE.read(COLLECTION_IMAGE_PATH(req.params.cid, req.params.file?.toLowerCase()));
    if (r) return r?.pipe(res);
    else return res.sendStatus(404);
}

export async function noteHandler(req: express.Request, res: express.Response) {
    if (!await hasPermissions(req.uid!, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    const r = COLLECTION_NOTES_STORE.read(COLLECTION_NOTE_PATH(req.params.cid, req.params.nid));
    if (r) return r?.pipe(res);
    else return res.sendStatus(404);
}

const raw = Router();
raw.get("/c/:cid/images/:file", checkUser, imageHandler);
raw.get("/c/:cid/notes/:nid", checkUser, noteHandler);
export default raw;