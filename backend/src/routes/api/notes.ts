import {Router} from 'express';
import {deleteNote, makeNote, Note, NoteType, renameNote} from '../../types/note';
import {firestore, storage} from "firebase-admin";
import {checkAdmin, getNote, getNotes, updateNote} from "../../utils";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import iconv from "iconv-lite";

import {failed, success} from "../../response";

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

notes.post("/:nid", checkAdmin, async (req, res) => {
    let note = await getNote(req.body.cid, req.params.nid);
    let old = {...note};
    if (note) {
        if (req.body.action && req.body.action === "add") return res.json(failed({reason: "note_already_exist"}));
        if (req.body.hasOwnProperty("nid")) note.nid = req.body.nid;
        if (req.body.hasOwnProperty("name")) note.name = req.body.name;
        if (req.body.hasOwnProperty("desc")) note.desc = req.body.desc;
        if (req.body.hasOwnProperty("type")) note.type = req.body.type;
        note.lastEdit = Date.now();
        note.lastEditBy = req.uid;
        await addAudit(simpleAudit(req.uid, note.nid, Category.NOTE, Action.EDIT, [old], {colls: [req.body.cid]}));
        if (old.nid !== note.nid) await renameNote(note.cid, old.nid, note.nid);
    } else {
        note = makeNote((await getNotes(req.body.cid)).length, req.params.nid, req.body.cid, req.uid, req.body.name, req.body.desc);
        await addAudit(simpleAudit(req.uid, note.nid, Category.NOTE, Action.CREATE, [], {colls: [req.body.cid]}));
    }
    await updateNote(note.cid, note.nid, note);
    res.json(success({note}));
});
notes.delete("/:nid", checkAdmin, async (req, res) => {
    let note = await getNote(req.body.cid, req.params.nid);
    if (note) await Promise.all([
        deleteNote(req.body.cid, req.params.nid),
        addAudit(simpleAudit(req.uid, note.nid, Category.NOTE, Action.EDIT, [note], {colls: [req.body.cid]}))
    ]);
    res.json(success());
});
notes.post("/:nid/upload", checkAdmin, async (req, res) => {
    if (!req.files) return res.json(failed('where is the file'));
    const newNoteSource = req.files.note_source;
    if (newNoteSource && "data" in newNoteSource) {
        const note = await getNote(req.body.cid, req.params.nid);
        if (!note) return res.json(failed({
            reason: "note_not_found",
            cid: req.body.cid,
            nid: req.params.nid
        }));
        const file = storage().bucket().file(`collections/${req.body.cid}/notes/${req.params.nid}`);
        let type: NoteType = null;
        // Jupyter notebook renderer
        if (newNoteSource.name.endsWith(".ipynb")) {
            type = "jupyter";
        } else if (newNoteSource.name.toLowerCase().endsWith(".md")) {
            type = "markdown";
        } else {
            if (newNoteSource.name.toLowerCase().endsWith(".html")) type = "html";
            let str = newNoteSource.data.toString();
            const match = /charset=([^"']+)/.exec(str); // charset fix
            if (match && match[1] && iconv.encodingExists(match[1])) newNoteSource.data = iconv.encode(iconv.decode(newNoteSource.data, match[1]), 'UTF-8')
        }
        await file.save(newNoteSource.data, {resumable: false});
        note.url = (await file.getSignedUrl({action: 'read', expires: '01-01-2500'}))[0];
        if (!note.type) note.type = type;
        note.lastEdit = Date.now();
        note.lastEditBy = req.uid;
        await updateNote(req.body.cid, req.params.nid, note);
        res.json(success({note}));
        await addAudit(simpleAudit(req.uid, note.nid, Category.NOTE, Action.UPLOAD_FILE, [file.name], {colls: [req.body.cid]}));
    } else return res.json(failed('where is the file'));
});

export default notes;