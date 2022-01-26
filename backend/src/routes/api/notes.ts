import {Router} from 'express';
import {deleteNote, makeNote, NoteType, renameNote} from '../../types/note';
import {checkEditPermissions, checkUser, getNote, getNotes, updateNote} from "../../utils";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import iconv from "iconv-lite";

import {failed, success} from "../../response";
import fileUpload from "express-fileupload";
import {COLLECTION_NOTE_PATH, COLLECTION_NOTE_PATH_VER, COLLECTION_NOTE_URL} from "./collections";
import {COLLECTION_NOTES_STORE} from "../../storage";

const notes = Router();

notes.get("/", async (req, res) => res.json(await getNotes(req.body.cid)));

notes.get("/:nid", async (req, res) => {
    const note = await getNote(req.body.cid, req.params.nid);
    if (!note) return res.json(failed({
        reason: "note_not_found",
        cid: req.body.cid,
        nid: req.params.nid
    }));
    else res.json(note);
});

const IS_EXTERNAL_NOTE_REGEX = /^https?:\/\//g
notes.post("/:nid", checkUser, async (req, res) => {
    if (!await checkEditPermissions(req, req.body.cid)) return res.json(failed("not_authorised"));
    let note = await getNote(req.body.cid, req.params.nid);
    if (note) {
        let old = {...note};
        if (req.body.action && req.body.action === "add") return res.json(failed({reason: "note_already_exist"}));
        if (req.body.hasOwnProperty("nid")) note.nid = req.body.nid;
        if (req.body.hasOwnProperty("name")) note.name = req.body.name;
        if (req.body.hasOwnProperty("desc")) note.desc = req.body.desc;
        if (req.body.hasOwnProperty("type")) note.type = req.body.type;
        note.lastEdit = Date.now();
        note.lastEditBy = req.uid!;
        await addAudit(simpleAudit(req.uid!, note.nid, Category.NOTE, Action.EDIT, [old], {colls: [req.body.cid]}));
        if (old.nid !== note.nid) {
            await renameNote(note.cid, old.nid, note.nid);
            // if url follows convention
            if (note.url && !IS_EXTERNAL_NOTE_REGEX.test(note.url)) note.url = COLLECTION_NOTE_URL(note.cid, note.nid);
        }
    } else {
        note = makeNote(-1, req.params.nid, req.body.cid, req.uid!, req.body.name, req.body.desc);
        await addAudit(simpleAudit(req.uid!, note.nid, Category.NOTE, Action.CREATE, [], {colls: [req.body.cid]}));
    }
    await updateNote(note.cid, note.nid, note);
    res.json(success({note}));
});
notes.delete("/:nid", checkUser, async (req, res) => {
    if (!await checkEditPermissions(req, req.body.cid)) return res.json(failed("not_authorised"));
    let note = await getNote(req.body.cid, req.params.nid);
    if (note) await Promise.all([
        deleteNote(req.body.cid, req.params.nid),
        addAudit(simpleAudit(req.uid!, note.nid, Category.NOTE, Action.EDIT, [note], {colls: [req.body.cid]}))
    ]);
    res.json(success());
});
notes.get("/:nid/history", checkUser, async (req, res) => {
    if (!await checkEditPermissions(req, req.body.cid)) return res.json(failed("not_authorised"));
    const prefix = COLLECTION_NOTE_PATH(req.body.cid, req.params.nid) + '/';
    const notes = COLLECTION_NOTES_STORE.query(p => p.path.startsWith(prefix));
    res.json(success({
        notes: notes.map(n => ({
            date: parseInt(n.path.substring(prefix.length), 10),
            uuid: n.uuid
        })).sort((a, b) => b.date - a.date)
    }));
});
notes.post("/:nid/upload", checkUser, fileUpload({limits: {fileSize: 64 * 1024 * 1024}}), async (req, res) => {
    if (!await checkEditPermissions(req, req.body.cid)) return res.json(failed("not_authorised"));
    if (!req.files) return res.json(failed('where is the file'));
    const newNoteSource = req.files.note_source;
    if (newNoteSource && "data" in newNoteSource) {
        const note = await getNote(req.body.cid, req.params.nid);
        if (!note) return res.json(failed({
            reason: "note_not_found",
            cid: req.body.cid,
            nid: req.params.nid
        }));
        let type!: NoteType;
        let name = newNoteSource.name.toLowerCase();
        // Jupyter notebook renderer
        if (name.endsWith(".ipynb")) type = "jupyter";
        else if (name.endsWith(".md")) type = "markdown";
        else {
            if (name.endsWith(".html")) type = "html";
            let str = newNoteSource.data.toString();
            const match = /charset=([^"']+)/.exec(str); // charset fix
            if (match && match[1] && iconv.encodingExists(match[1]))
                newNoteSource.data = iconv.encode(iconv.decode(newNoteSource.data, match[1]), 'UTF-8')
        }

        const path = COLLECTION_NOTE_PATH(req.body.cid, req.params.nid);
        const date = Date.now();
        COLLECTION_NOTES_STORE.rename(path, COLLECTION_NOTE_PATH_VER(req.body.cid, req.params.nid, date));
        COLLECTION_NOTES_STORE.write(path).write(newNoteSource.data);
        note.url = COLLECTION_NOTE_URL(req.body.cid, req.params.nid);

        if (!note.type) note.type = type;
        note.lastEdit = date;
        note.lastEditBy = req.uid!;
        await updateNote(req.body.cid, req.params.nid, note);
        res.json(success({note}));
        await addAudit(simpleAudit(req.uid!, note.nid, Category.NOTE, Action.UPLOAD_FILE, [name], {colls: [req.body.cid]}));
    } else return res.json(failed('where is the file'));
});

export default notes;