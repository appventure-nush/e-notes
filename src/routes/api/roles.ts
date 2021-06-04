import {Router} from 'express';
import Role from '../../types/role';
import {checkAdmin, checkUser, getAllRoles, getRole, updateRole} from '../../utils';

const roles = Router();

roles.get("/", checkUser, (req, res) => res.json(getAllRoles()));

roles.get("/:rid", checkUser, async (req, res) => {
    const role = await getRole(req.params.rid);
    if (!role) return res.status(404).json({
        reason: "role_not_found",
        rid: req.params.rid
    })
    else res.json(role);
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
    if (req.body.rid !== req.params.rid) return res.status(400).json({
        reason: "huh",
        rid: req.params.rid
    });
    else {
        const role = new Role(req.body.rid, req.body.name, req.body.desc, req.body.defaultPerm);
        role.setPermissions(req.body.permissions);
        await updateRole(role.rid, role);
        res.json(role);
    }
});

roles.post("/:rid/admin", checkAdmin, async (req, res) => {
    try {
        const role = await getRole(req.params.rid);
        if (!role) return res.status(404).json({
            reason: "role_not_found",
            rid: req.params.rid
        });
        if (typeof req.body.defaultPerm === 'boolean') role.defaultPerm = req.body.defaultPerm;
        if (typeof req.body.permissions === 'object') role.setPermissions(req.body.permissions);
        if (typeof req.body.name === 'string') role.name = req.body.name;
        if (typeof req.body.desc === 'string') role.desc = req.body.desc;
        await updateRole(role.rid, role);
        res.json(role);
    } catch (e) {
        res.status(500).send("failed")
    }
});

export default roles;