import {Router} from 'express';

const roles = Router();

roles.get("/:role_id", async (req, res, next) => {
    const doc = await req.app.locals.db.collection("roles").doc(req.params.role_id).get();

    if (!doc.exists) return res.status(404).json({
        reason: "role_not_found",
        role_id: req.params.role_id
    })
    else res.json(doc.data());
});

roles.delete("/:role_id", async (req, res, next) => {
    const ref = req.app.locals.db.collection("roles").doc(req.params.role_id);
    if (!(await ref.get()).exists) return res.status(404).json({
        reason: "role_not_found",
        role_id: req.params.role_id
    });
    else {
        await ref.delete();
        res.json({status: "ok"});
    }
});

roles.post("/:role_id/create", async (req, res, next) => {
    if (!req.body.name) return res.status(400).json({
        reason: "name_required_for_creation",
        role_id: req.params.role_id
    });

    const data = {
        role_id: req.params.role_id,
        name: req.body.name || req.params.role_id,
        desc: req.body.desc || "No descriptions yet.",
        permissions: req.body.permissions || []
    };
    const ref = req.app.locals.db.collection("roles").doc(req.params.role_id);
    if ((await ref.get()).exists) return res.status(403).json({
        reason: "role_already_exists",
        role_id: req.params.role_id
    });
    else {
        await ref.set(data);
        res.json(data);
    }
});

export default roles;