import {Router} from 'express';
import Role from '../types/role';
import {getRole, updateRoleCache, checkAdmin} from '../utils';

const roles = Router();

roles.get("/:roleId", async (req, res, next) => {
    const role = await getRole(req.params.roleId);
    if (!role) return res.status(404).json({
        reason: "role_not_found",
        roleId: req.params.roleId
    })
    else res.json(role);
});

roles.delete("/:roleId", checkAdmin, async (req, res, next) => {
    if (!await getRole(req.params.roleId)) return res.status(404).json({
        reason: "role_not_found",
        roleId: req.params.roleId
    });
    else {
        const ref = req.app.locals.db.collection("roles").doc(req.params.roleId);
        await ref.delete();
        updateRoleCache(req.params.roleId, null);
        res.json({status: "ok"});
    }
});

roles.post("/:roleId", checkAdmin, async (req, res, next) => {
    if (!req.body.name) return res.status(400).json({
        reason: "name_required_for_creation",
        roleId: req.params.roleId
    });
    if (await getRole(req.params.roleId)) return res.status(403).json({
        reason: "role_already_exists",
        roleId: req.params.roleId
    });
    else {
        const ref = req.app.locals.db.collection("roles").doc(req.params.roleId);
        const role = new Role(req.params.roleId, req.body.name, req.body.desc);
        await ref.set(role);
        updateRoleCache(req.params.roleId, role);
        res.json(role);
    }
});

roles.get("/:roleId/:operation/:cid", checkAdmin, async (req, res, next) => {
    const doc = await req.app.locals.db.collection("roles").doc(req.params.roleId).get();
    if (!doc.exists) return res.status(404).json({
        reason: "role_not_found",
        roleId: req.params.roleId
    });
    const role = doc.data() as Role;
    try {
        if (req.params.operation === "grant") return await role.setPermission(req.params.cid, true);
        else if (req.params.operation === "deny") return await role.setPermission(req.params.cid, false);
        else if (req.params.operation === "remove") return await role.setPermission(req.params.cid, undefined);
        else return res.status(400).json({
                reason: "invalid_operation",
                operation: req.params.operation,
                allowed: ['grant', 'deny', 'remove']
            });
    } catch (e) {
        res.status(500).json({
            reason: "error",
            roleId: req.params.roleId,
            cid: req.params.cid,
            operation: req.params.operation,
        });
    }
});

export default roles;