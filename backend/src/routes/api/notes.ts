import {Router} from 'express';
import {deleteNote, makeNote, NoteType, renameNote} from '../../types/note';
import {storage} from "firebase-admin";
import {checkEditPermissions, checkUser, getNote, getNotes, updateNote} from "../../utils";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import iconv from "iconv-lite";

import {failed, success} from "../../response";
import fileUpload from "express-fileupload";

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
            if (note.url?.startsWith('https://storage.googleapis.com/e-notes-nush.appspot.com')) note.url = (await storage().bucket().file(`collections/${note.cid}/notes/${note.nid}`).getSignedUrl({
                action: 'read',
                expires: '01-01-2500'
            }))[0];
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
        const file = storage().bucket().file(`collections/${req.body.cid}/notes/${req.params.nid}`);
        let type!: NoteType;
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
        note.lastEditBy = req.uid!;
        await updateNote(req.body.cid, req.params.nid, note);
        res.json(success({note}));
        await addAudit(simpleAudit(req.uid!, note.nid, Category.NOTE, Action.UPLOAD_FILE, [file.name], {colls: [req.body.cid]}));
    } else return res.json(failed('where is the file'));
});

export default notes;