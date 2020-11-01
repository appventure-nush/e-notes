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

roles.post("/:role_id", async (req, res, next) => {
    if (!req.body.name) return res.status(400).json({
        reason: "name_required_for_creation",
        role_id: req.params.role_id
    });

    const data = {
        role_id: req.params.role_id,
        name: req.body.name || req.params.role_id,
        desc: req.body.desc || "No descriptions yet.",
        permissions: req.body.permissions.map((id: string) => req.app.locals.db.collection("collections").doc(id).ref) || []
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

roles.get("/:role_id/:operation/:coll_id", async (req, res, next) => {
    const doc = await req.app.locals.db.collection("roles").doc(req.params.role_id).get();
    if (!doc.exists) return res.status(404).json({
        reason: "role_not_found",
        role_id: req.params.role_id
    });
    try {
        if (req.params.operation === "add") return await doc.update({
            permissions: req.app.locals.db.FieldValue.arrayUnion(req.app.locals.db.collection("collections").doc(req.params.coll_id).ref)
        }); else if (req.params.operation === "remove") return await doc.update({
            permissions: req.app.locals.db.FieldValue.arrayRemove(req.app.locals.db.collection("collections").doc(req.params.coll_id).ref)
        }); else return res.status(400).json({
            reason: "invalid_operation",
            operation: req.params.operation
        });
    } catch (e) {
        res.status(500).json({
            reason: "error",
            role_id: req.params.role_id,
            coll_id: req.params.coll_id,
            operation: req.params.operation,
        });
    }
});

export default roles;