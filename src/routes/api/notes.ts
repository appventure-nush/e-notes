import {Router} from 'express';
import Note from '../../types/note';
import admin, {firestore, storage} from "firebase-admin";
import {checkAdmin} from "../../utils";
import DocumentSnapshot = admin.firestore.DocumentSnapshot;

const notes = Router();

notes.get("/", async (req, res) => { // a lot of info
    const snapshot = await firestore().collection("collections").doc(req.body.cid).collection("notes").get();
    res.json(snapshot.docs.map((doc: DocumentSnapshot) => doc.data()));
});

notes.get("/:nid", async (req, res) => {
    const doc = await firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.nid).get();
    if (!doc.exists) return res.status(404).json({
        reason: "note_not_found",
        cid: req.body.cid,
        nid: req.params.nid
    });
    else res.json(doc.data());
});

notes.post("/:nid", checkAdmin, async (req, res) => {
    const ref = firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.nid);
    let note;
    const documentSnapshot = await ref.get();
    if (documentSnapshot.exists) {
        if (req.body.action && req.body.action === "add") return res.status(400).json({reason: "note_already_exist"});
        note = new Note(documentSnapshot.data());
        if (req.body.nid) note.nid = req.body.nid;
        if (req.body.name) note.name = req.body.name;
        if (req.body.desc) note.desc = req.body.desc;
        note.lastEdit = Date.now();
    } else {
        note = new Note(req.params.nid, req.body.cid, req.body.name, req.body.desc);
    }
    await ref.set(note.toData());
    res.json(note);
});
notes.delete("/:nid", checkAdmin, async (req, res) => {
    const ref = firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.nid);
    const documentSnapshot = await ref.get();
    if (documentSnapshot.exists) {
        const file = storage().bucket().file(`collections/${req.body.cid}/notes/${req.params.nid}.html`);
        await ref.delete();
        await file.delete();
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
        const note = new Note(doc.data());
        const file = storage().bucket().file(`collections/${req.body.cid}/notes/${req.params.nid}.html`);
        await file.save(new Uint8Array(newNoteSource.data), {resumable: false});
        note.url = (await file.getSignedUrl({
            action: 'read',
            expires: '01-01-2500'
        }))[0];
        await ref.set(note.toData());
        res.json({
            status: 'success',
            note
        });
    } else return res.json({status: 'failed', reason: 'where is the file'});
});

function escape(str: string) {
    return str.replace(/[\s\/]+/g, '_');
}

export default notes;