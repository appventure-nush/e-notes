import express, {Router} from "express";
import {checkUser, hasPermissions, noteCache} from "../utils";
import {COLLECTION_IMAGE_STORE, COLLECTION_NOTES_STORE, USERS_STORE} from "../storage";
import {COLLECTION_IMAGE_PATH, COLLECTION_NOTE_PATH, COLLECTION_NOTE_PATH_VER} from "./api/collections";

export const RAW_BASE_URL = "https://enotes.nush.app/raw";

// All user provided content are free to access by anyone
export async function userHandler(req: express.Request, res: express.Response) {
    const r = USERS_STORE.read(req.params[0]);
    if (r) return r?.pipe(res);
    else return res.sendStatus(404);
}

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
    const url = noteCache.get(req.params.cid)?.find(n => n.nid === req.params.nid)?.url;
    if (url) return res.redirect(url);
    else return res.sendStatus(404);
}

export async function noteHistoryHandler(req: express.Request, res: express.Response) {
    if (!await hasPermissions(req.uid!, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    const date = parseInt(req.params.date, 10);
    if (isNaN(date)) return res.json({status: 'failed', reason: 'wrong_date'});
    const r = COLLECTION_NOTES_STORE.read(COLLECTION_NOTE_PATH_VER(req.params.cid, req.params.nid, date));
    if (r) return r?.pipe(res);
    else return res.sendStatus(404);
}

const raw = Router();
raw.get("/u/*", userHandler);
raw.get("/c/:cid/images/:file", checkUser, imageHandler);
raw.get("/c/:cid/notes/:nid", checkUser, noteHandler);
raw.get("/c/:cid/notes/:nid/:date", checkUser, noteHistoryHandler);
export default raw;