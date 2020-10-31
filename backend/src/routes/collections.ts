import {Router} from 'express';

import notesRouter from './notes';

const collections = Router();

collections.get("/:coll_id", async (req, res, next) => {
    const doc = await req.app.locals.db.collection("collections").doc(req.params.coll_id).get();

    if (!doc.exists) return res.status(404).json({
        reason: "collection_not_found",
        coll_id: req.params.coll_id
    })
    else res.json(doc.data());
});

collections.delete("/:coll_id", async (req, res, next) => {
    const ref = req.app.locals.db.collection("collections").doc(req.params.coll_id);

    if (!(await ref.get()).exists) return res.status(404).json({
        reason: "collection_not_found",
        coll_id: req.params.coll_id
    });
    else {
        await ref.delete();
        res.json({status: "ok"});
    }
});

collections.post("/:coll_id", async (req, res, next) => {
    const data = {
        coll_id: req.params.coll_id,
        name: req.body.name || req.params.coll_id,
        desc: req.body.desc || "No descriptions yet."
    };
    const ref = req.app.locals.db.collection("collections").doc(req.params.coll_id);
    if ((await ref.get()).exists) return res.status(403).json({
        reason: "collection_already_exists",
        coll_id: req.params.coll_id
    });
    else {
        await ref.set(data);
        res.json(data);
    }
});

collections.use("/:coll_id/notes", (req, res, next) => {
    req.body.coll_id = req.params.coll_id;
    next();
}, notesRouter);

export default collections;