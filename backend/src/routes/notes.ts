import {Router} from 'express';

const notes = Router();

notes.get("/", async (req, res, next) => {
    const snapshot = await req.app.locals.db.collection("collections").doc(req.body.coll_id).collection("notes").get();

    if (snapshot.empty) return res.status(404).json({
        reason: "no_notes_found",
        coll_id: req.body.coll_id
    });
    else res.json(snapshot.docs.map((doc: { id: any; data: () => { (): any; new(): any; name: any; }; }) => {
        return {id: doc.id, name: doc.data().name}
    }));
});

notes.get("/:note_id", async (req, res, next) => {
    const doc = await req.app.locals.db.collection("collections").doc(req.body.coll_id).collection("notes").doc(req.params.note_id).get();

    if (!doc.exists) return res.status(404).json({
        reason: "collection_or_note_not_found",
        coll_id: req.body.coll_id,
        note_id: req.params.note_id
    });
    else res.json(doc.data());
});

export default notes;