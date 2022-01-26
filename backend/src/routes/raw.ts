import express, {Router} from "express";
import {checkUser, getNote, hasPermissions} from "../utils";
import {COLLECTION_IMAGE_STORE, COLLECTION_NOTES_STORE, USERS_STORE} from "../storage";
import {
    COLLECTION_IMAGE_PATH,
    COLLECTION_NOTE_PATH,
    COLLECTION_NOTE_PATH_VER,
    COLLECTION_NOTE_URL
} from "./api/collections";

const CACHE_TIME = 365 * 24 * 60 * 60;

export const RAW_BASE_URL = "https://enotes.nush.app/raw";

// All user provided content are free to access by anyone
export async function userHandler(req: express.Request, res: express.Response) {
    const r = USERS_STORE.read(req.params[0]);
    res.set('Cache-control', `public, max-age=${CACHE_TIME}`);
    if (r) return r?.pipe(res);
    else return res.sendStatus(404);
}

export async function imageHandler(req: express.Request, res: express.Response) {
    if (!await hasPermissions(req.uid!, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    const r = COLLECTION_IMAGE_STORE.read(COLLECTION_IMAGE_PATH(req.params.cid, req.params.file?.toLowerCase()));
    res.set('Cache-control', `public, max-age=${CACHE_TIME}`);
    if (r) return r?.pipe(res);
    else return res.sendStatus(404);
}

export async function noteHandler(req: express.Request, res: express.Response) {
    if (!await hasPermissions(req.uid!, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    const r = COLLECTION_NOTES_STORE.read(COLLECTION_NOTE_PATH(req.params.cid, req.params.nid));
    res.set('Cache-control', `public, max-age=${CACHE_TIME}`);
    if (r) return r?.pipe(res);
    const note = await getNote(req.params.cid, req.params.nid);
    if (note?.url && note?.url !== COLLECTION_NOTE_URL(note.cid, note.nid)) return res.redirect(note.url);
    else return res.sendStatus(404);
}

export async function noteHistoryHandler(req: express.Request, res: express.Response) {
    if (!await hasPermissions(req.uid!, req.params.cid)) return res.json({status: 'failed', reason: 'no_perm'});
    const date = parseInt(req.params.date, 10);
    res.set('Cache-control', `public, max-age=${CACHE_TIME}`);
    if (isNaN(date)) return res.json({status: 'failed', reason: 'wrong_date'});
    const r = COLLECTION_NOTES_STORE.read(COLLECTION_NOTE_PATH_VER(req.params.cid, req.params.nid, date));
    if (r) return r?.pipe(res);
    else return res.sendStatus(404);
}

const raw = Router();
raw.get("/u/*", userHandler);
raw.get("/c/:cid/images/:file", checkUser, imageHandler);
raw.get("/c/:cid/notes/:nid", checkUser, noteHandler);
raw.get("/c/:cid/notes/:nid/0", checkUser, noteHandler);
raw.get("/c/:cid/notes/:nid/:date", checkUser, noteHistoryHandler);
export default raw;