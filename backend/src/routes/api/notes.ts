import {Router} from 'express';
import Note from '../../types/note';
import admin, {firestore, storage} from "firebase-admin";
import {checkAdmin} from "../../utils";
import DocumentSnapshot = admin.firestore.DocumentSnapshot;

const notes = Router();

notes.get("/", async (req, res) => { // a lot of info
    const snapshot = await firestore().collection("collections").doc(req.body.cid).collection("notes").get();

    if (snapshot.empty) return res.status(404).json({
        reason: "no_notes_found",
        cid: req.body.cid
    });
    else res.json(snapshot.docs.map((doc: DocumentSnapshot) => doc.data()));
});

notes.get("/:note_id", async (req, res) => {
    const doc = await firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.note_id).get();
    if (!doc.exists) return res.status(404).json({
        reason: "collection_or_note_not_found",
        cid: req.body.cid,
        note_id: req.params.note_id
    });
    else res.json(doc.data());
});

notes.post("/:note_id", checkAdmin, async (req, res) => {
    const ref = firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.note_id);
    if ((await ref.get()).exists) return res.status(404).json({
        reason: "note_already_exists",
        cid: req.body.cid,
        note_id: req.params.note_id
    });
    const note = new Note(req.params.note_id, req.body.cid, req.body.name, req.body.desc);
    await ref.set(note.toData());
    res.json(note);
});
notes.post("/:note_id/upload", checkAdmin, async (req, res) => {
    if (!req.files) return res.json({status: 'failed', reason: 'where is the file'});
    let new_note_source = req.files.note_source;
    if (new_note_source && "data" in new_note_source) {
        const ref = firestore().collection("collections").doc(req.body.cid).collection("notes").doc(req.params.note_id);
        const doc = await ref.get();
        if (!doc.exists) return res.status(404).json({
            reason: "collection_or_note_not_found",
            cid: req.body.cid,
            note_id: req.params.note_id
        });
        const note = new Note(doc.data());

        const file = storage().bucket().file(`collections/${req.body.cid}/notes/${req.params.note_id}.html`);
        await file.save(new Uint8Array(new_note_source.data), {resumable: false});
        note.url = (await file.getSignedUrl({
            action: 'read',
            expires: '01-01-2500'
        }))[0];
        res.json({
            status: 'success',
            note: note.toData()
        });
    } else return res.json({status: 'failed', reason: 'where is the file'});
});

function escape(str: string) {
    return str.replace(/[\s\/]+/g, '_');
}

export default notes;