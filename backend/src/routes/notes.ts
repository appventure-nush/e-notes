import {Router} from 'express';
import {File} from "@google-cloud/storage/build/src/file";
import Note from '../types/note';
import admin from "firebase-admin";
import DocumentSnapshot = admin.firestore.DocumentSnapshot;

const notes = Router();

notes.get("/", async (req, res, next) => { // a lot of info
    const snapshot = await req.app.locals.db.collection("collections").doc(req.body.cid).collection("notes").get();

    if (snapshot.empty) return res.status(404).json({
        reason: "no_notes_found",
        cid: req.body.cid
    });
    else res.json(snapshot.docs.map((doc: DocumentSnapshot) => doc.data()));
});

notes.get("/:note_id", async (req, res, next) => {
    const doc = await req.app.locals.db.collection("collections").doc(req.body.cid).collection("notes").doc(req.params.note_id).get();
    if (!doc.exists) return res.status(404).json({
        reason: "collection_or_note_not_found",
        cid: req.body.cid,
        note_id: req.params.note_id
    });
    else res.json(doc.data());
});

notes.post("/:note_id", async (req, res, next) => {
    const ref = req.app.locals.db.collection("collections").doc(req.body.cid).collection("notes").doc(req.params.note_id);
    if ((await ref.get()).exists) return res.status(404).json({
        reason: "note_already_exists",
        cid: req.body.cid,
        note_id: req.params.note_id
    });
    const note = new Note(req.params.note_id, req.body.cid, req.body.name, req.body.desc);
    ref.set(note.toData());
    res.json(note);
});
notes.post("/:note_id/upload", async (req, res, next) => {
    const ref = req.app.locals.db.collection("collections").doc(req.body.cid).collection("notes").doc(req.params.note_id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({
        reason: "collection_or_note_not_found",
        cid: req.body.cid,
        note_id: req.params.note_id
    });
    const note = new Note(doc.data());
    const file = req.app.locals.bucket.file(`collections/${req.body.cid}/notes/${req.params.note_id}.html`) as File;
    file.save({})
    res.json(note);
});

function escape(str: string) {
    return str.replace(/[\s\/]+/g, '_');
}

export default notes;