import {Router} from 'express';
import {makeNote, toNote} from '../../types/note';
import {firestore, storage} from "firebase-admin";
import {checkAdmin, getNote, getNotes, updateNote} from "../../utils";

import iconv from "iconv-lite";

const notes = Router();

notes.get("/", async (req, res) => res.json((await getNotes(req.body.cid))));

notes.get("/:nid", async (req, res) => {
    const note = await getNote(req.body.cid, req.params.nid);
    if (!note) return res.status(404).json({
        reason: "note_not_found",
        cid: req.body.cid,
        nid: req.params.nid
    });
    else res.json(note);
});

notes.post("/:nid", checkAdmin, async (req, res) => {
    const ref = firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.nid);
    let note;
    const documentSnapshot = await ref.get();
    if (documentSnapshot.exists) {
        if (req.body.action && req.body.action === "add") return res.status(400).json({reason: "note_already_exist"});
        note = toNote(documentSnapshot.data());
        if (req.body.nid) note.nid = req.body.nid;
        if (req.body.name) note.name = req.body.name;
        if (req.body.desc) note.desc = req.body.desc;
        note.lastEdit = Date.now();
    } else {
        note = makeNote(req.params.nid, req.body.cid, req.body.name, req.body.desc);
    }
    updateNote(req.body.cid, req.params.nid, note);
    res.json(note);
    await ref.set(note);
});
notes.delete("/:nid", checkAdmin, async (req, res) => {
    const ref = firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.nid);
    if ((await ref.get()).exists) {
        updateNote(req.body.cid, req.params.nid, null);
        await Promise.all([ref.delete(), storage().bucket().file(`collections/${req.body.cid}/notes/${req.params.nid}.html`).delete()]);
    }
    res.json({status: "ok"});
});
notes.post("/:nid/upload", checkAdmin, async (req, res) => {
    if (!req.files) return res.json({status: 'failed', reason: 'where is the file'});
    const newNoteSource = req.files.note_source;
    if (newNoteSource && "data" in newNoteSource) {
        const ref = firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.nid);
        const doc = await ref.get();
        if (!doc.exists) return res.status(404).json({
            reason: "note_not_found",
            cid: req.body.cid,
            nid: req.params.nid
        });
        const note = toNote(doc.data());
        const file = storage().bucket().file(`collections/${req.body.cid}/notes/${req.params.nid}.html`);
        let str = newNoteSource.data.toString();
        const match = /charset=([^"']+)/.exec(str);
        if (match && match[1] && iconv.encodingExists(match[1])) str = iconv.decode(newNoteSource.data, match[1]);
        await file.save(str, {resumable: false});
        note.url = (await file.getSignedUrl({
            action: 'read',
            expires: '01-01-2500'
        }))[0];
        updateNote(req.body.cid, req.params.nid, note);
        res.json({
            status: 'success',
            note: note
        });
        await ref.set(note);
    } else return res.json({status: 'failed', reason: 'where is the file'});
});

export default notes;