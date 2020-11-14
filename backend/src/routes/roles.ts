import {Router} from 'express';
import Role from '../types/role';
import {getRole, updateRoleCache, checkAdmin} from '../utils';

const roles = Router();

roles.get("/:rid", async (req, res, next) => {
    const role = await getRole(req.params.rid);
    if (!role) return res.status(404).json({
        reason: "role_not_found",
        rid: req.params.rid
    })
    else res.json(role);
});

roles.delete("/:rid", checkAdmin, async (req, res, next) => {
    if (!await getRole(req.params.rid)) return res.status(404).json({
        reason: "role_not_found",
        rid: req.params.rid
    });
    else {
        const ref = req.app.locals.db.collection("roles").doc(req.params.rid);
        await ref.delete();
        updateRoleCache(req.params.rid, null);
        res.json({status: "ok"});
    }
});

roles.post("/:rid", checkAdmin, async (req, res, next) => {
    if (!req.body.name) return res.status(400).json({
        reason: "name_required_for_creation",
        rid: req.params.rid
    });
    if (await getRole(req.params.rid)) return res.status(403).json({
        reason: "role_already_exists",
        rid: req.params.rid
    });
    else {
        const ref = req.app.locals.db.collection("roles").doc(req.params.rid);
        const role = new Role(req.params.rid, req.body.name, req.body.desc);
        await ref.set(role.toData());
        updateRoleCache(req.params.rid, role);
        res.json(role);
    }
});

roles.get("/:rid/:operation/:cid", checkAdmin, async (req, res, next) => {
    const role = await getRole(req.params.rid);
    if (!role) return res.status(404).json({
        reason: "role_not_found",
        rid: req.params.rid
    });
    try {
        if (req.params.operation === "grant") await role.setPermission(req.params.cid, true);
        else if (req.params.operation === "deny") await role.setPermission(req.params.cid, false);
        else if (req.params.operation === "remove") await role.setPermission(req.params.cid, undefined);
        else return res.status(400).json({
                reason: "invalid_operation",
                operation: req.params.operation,
                allowed: ['grant', 'deny', 'remove']
            });
        res.json(role);
    } catch (e) {
        console.log(e);
        res.status(500).json({
            reason: "error",
            rid: req.params.rid,
            cid: req.params.cid,
            operation: req.params.operation,
        });
    }
});

export default roles;