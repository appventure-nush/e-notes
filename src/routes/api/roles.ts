import {Router} from 'express';
import Role from '../../types/role';
import {checkAdmin, checkUser, getAllRoles, getRole, updateRole} from '../../utils';
import {firestore} from "firebase-admin";

const roles = Router();

roles.get("/", checkUser, (req, res) => res.json(getAllRoles().map(role=>role.toData())));

roles.get("/:rid", checkUser, async (req, res) => {
    const role = await getRole(req.params.rid);
    if (!role) return res.status(404).json({
        reason: "role_not_found",
        rid: req.params.rid
    })
    else res.json(role.toData());
});

roles.get("/:rid", checkUser, async (req, res) => {
    const role = await getRole(req.params.rid);
    if (!role) return res.status(404).json({
        reason: "role_not_found",
        rid: req.params.rid
    })
    else res.json(role.toData());
});

roles.delete("/:rid", checkAdmin, async (req, res) => {
    if (!await getRole(req.params.rid)) return res.status(404).json({
        reason: "role_not_found",
        rid: req.params.rid
    });
    else {
        await updateRole(req.params.rid, null);
        res.json({status: "ok"});
    }
});

roles.post("/:rid", checkAdmin, async (req, res) => {
    if (!req.body.name) return res.status(400).json({
        reason: "name_required_for_creation",
        rid: req.params.rid
    });
    if (await getRole(req.params.rid)) return res.status(403).json({
        reason: "role_already_exists",
        rid: req.params.rid
    });
    else {
        const ref = firestore().collection("roles").doc(req.params.rid);
        const role = new Role(req.params.rid, req.body.name, req.body.desc);
        await ref.set(role.toData());
        res.json(role.toData());
    }
});

roles.get("/:rid/:operation/:cid", checkAdmin, async (req, res) => {
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
        res.json(role.toData());
    } catch (e) {
        // await error('role edit error', {
        //     message: e.message,
        //     rid: req.params.rid,
        //     cid: req.params.cid,
        //     operation: req.params.operation
        // });
        res.status(500).json({
            reason: "error",
            rid: req.params.rid,
            cid: req.params.cid,
            operation: req.params.operation,
        });
    }
});

export default roles;