import {Router} from 'express';
import {makeNote, Note, NoteType} from '../../types/note';
import {firestore, storage} from "firebase-admin";
import {checkAdmin, getNote, getNotes, updateNote} from "../../utils";
import Markdown from 'markdown-it';
import iconv from "iconv-lite";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";

import katex from '@traptitech/markdown-it-katex';
import highlight from "markdown-it-highlightjs";
import {failed, success} from "../../response";

const md = new Markdown({
    html: true,
    linkify: true
});
md.use(katex);
md.use(highlight);

// tslint:disable-next-line:no-var-requires
const nb = require("notebookjs");
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
        if (req.body.nid) note.nid = req.body.nid;
        if (req.body.name) note.name = req.body.name;
        if (req.body.desc) note.desc = req.body.desc;
        note.lastEdit = Date.now();
        note.lastEditBy = req.uid;
        await addAudit(simpleAudit(req.uid, note.nid, Category.NOTE, Action.EDIT, [old], {colls: [req.body.cid]}));
    } else {
        note = makeNote((await getNotes(req.body.cid)).length, req.params.nid, req.body.cid, req.uid, req.body.name, req.body.desc);
        await addAudit(simpleAudit(req.uid, note.nid, Category.NOTE, Action.CREATE, [], {colls: [req.body.cid]}));
    }
    updateNote(req.body.cid, req.params.nid, note);
    await firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.nid).set(note);
    res.json(note);
});
notes.delete("/:nid", checkAdmin, async (req, res) => {
    let note = await getNote(req.body.cid, req.params.nid);
    if (note) {
        updateNote(req.body.cid, req.params.nid, null);
        try {
            await Promise.all([
                firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.nid).delete(),
                storage().bucket().file(`collections/${req.body.cid}/notes/${req.params.nid}.html`).delete(),
                addAudit(simpleAudit(req.uid, note.nid, Category.NOTE, Action.EDIT, [note], {colls: [req.body.cid]}))
            ]);
        } catch (e) {

        }
    }
    res.json(success());
});
notes.post("/:nid/upload", checkAdmin, async (req, res) => {
    if (!req.files) return res.json(failed('where is the file'));
    const newNoteSource = req.files.note_source;
    if (newNoteSource && "data" in newNoteSource) {
        const ref = firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.nid);
        const doc = await ref.get();
        if (!doc.exists) return res.json({
            reason: "note_not_found",
            cid: req.body.cid,
            nid: req.params.nid
        });
        const note = doc.data() as Note;
        const file = storage().bucket().file(`collections/${req.body.cid}/notes/${req.params.nid}.html`);
        let str = newNoteSource.data.toString();
        let type: NoteType = "html";
        // Jupyter notebook renderer
        if (newNoteSource.name.endsWith(".ipynb")) {
            type = "jupyter";
            str = JSON.stringify(JSON.parse(str));
        } else if (newNoteSource.name.toLowerCase().endsWith(".md")) {
            type = "markdown";
        } else {
            const match = /charset=([^"']+)/.exec(str); // charset fix
            if (match && match[1] && iconv.encodingExists(match[1])) str = iconv.decode(newNoteSource.data, match[1]);
        }
        await file.save(str, {resumable: false});
        note.url = (await file.getSignedUrl({action: 'read', expires: '01-01-2500'}))[0];
        note.type = type;
        note.lastEdit = Date.now();
        note.lastEditBy = req.uid;
        updateNote(req.body.cid, req.params.nid, note);
        res.json(success({
            note
        }));
        await ref.set(note);
        await addAudit(simpleAudit(req.uid, note.nid, Category.NOTE, Action.UPLOAD_FILE, [file.name], {colls: [req.body.cid]}));
    } else return res.json(failed('where is the file'));
});

export default notes;