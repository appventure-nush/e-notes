import {Router} from 'express';

const collections = Router();

collections.get("/:id", async (req, res, next) => {
    const doc = await req.app.locals.db.collection("collections").doc(req.params.id).get();

    if (!doc.exists) return res.status(404).json({
        reason: "collection_not_found",
        id: req.params.id
    })
    else res.json(doc.data());
});

collections.get("/:id/delete", async (req, res, next) => {
    const ref = req.app.locals.db.collection("collections").doc(req.params.id);

    if (!(await ref.get()).exists) return res.status(404).json({
        reason: "collection_not_found",
        id: req.params.id
    });
    else {
        await ref.delete();
        res.json({status: "ok"});
    }
});

collections.post("/:id/create", async (req, res, next) => {
    if (!req.body.name) return res.status(400).json({
        reason: "name_required_for_creation",
        id: req.params.id
    });

    const data = {
        id: req.params.id,
        name: req.body.name,
        desc: req.body.desc || "No descriptions yet."
    };
    const ref = req.app.locals.db.collection("collections").doc(req.params.id);
    if ((await ref.get()).exists) return res.status(403).json({
        reason: "collection_already_exists",
        collection_id: req.params.id
    });
    else {
        await ref.set(data);
        res.json(data);
    }
});

export default collections;