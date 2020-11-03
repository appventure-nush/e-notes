import {Router} from 'express';

const notes = Router();

notes.get("/", async (req, res, next) => {
    const snapshot = await req.app.locals.db.collection("collections").doc(req.body.cid).collection("notes").get();

    if (snapshot.empty) return res.status(404).json({
        reason: "no_notes_found",
        cid: req.body.cid
    });
    else res.json(snapshot.docs.map((doc: { id: any; data: () => { (): any; new(): any; name: any; }; }) => {
        return {id: doc.id, name: doc.data().name}
    }));
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

export default notes;