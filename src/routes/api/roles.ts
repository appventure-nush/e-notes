import {Router} from 'express';
import {makeRole} from '../../types/role';
import {
    checkAdmin,
    checkUser,
    findUserWithRole,
    getAllRoles,
    getRole,
    getUsers,
    updateRole,
    updateUser
} from '../../utils';
import apicache from 'apicache';
import {_setPermissions} from "../../types/permissions";
import {User} from "../../types/user";

const cache = apicache.middleware;
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

roles.get("/:rid/users", checkUser, cache('1 min'), async (req, res) => {
    // @ts-ignore
    req.apicacheGroup = req.params.rid;
    return res.json(await findUserWithRole(req.params.rid));
});

roles.post("/:rid/users", checkAdmin, async (req, res) => {
    let foundUsers: User[];
    if (req.body.uids) foundUsers = (req.body.uids as string[]).map(e => getUsers().find(u => u.uid === e));
    if (req.body.emails) foundUsers = (req.body.emails as string[]).map(e => getUsers().find(u => u.email === e));
    if (!foundUsers || foundUsers.length === 0) res.status(400).json({
        reason: "no users specified",
        rid: req.params.rid
    }); else {
        let updated = 0;
        foundUsers = foundUsers.filter(u => Boolean(u));
        const result = await Promise.all(foundUsers.map(user => {
            if (req.body.action === "add") {
                if (user.roles.includes(req.params.rid)) return user;
                user.roles.push(req.params.rid);
                updated++;
            } else {
                if (!user.roles.includes(req.params.rid)) return user;
                user.roles = user.roles.filter(role => role !== req.params.rid);
                updated++;
            }
            return updateUser(user.uid, user);
        }));
        apicache.clear(req.params.rid);
        res.json({
            status: "ok",
            updated,
            users: result
        });
    }
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
        const role = makeRole(req.body.rid, req.body.name, req.body.desc, req.body.defaultPerm);
        _setPermissions(role, req.body.permissions);
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
        if (typeof req.body.permissions === 'object') _setPermissions(role, req.body.permissions);
        if (typeof req.body.name === 'string') role.name = req.body.name;
        if (typeof req.body.desc === 'string') role.desc = req.body.desc;
        await updateRole(role.rid, role);
        res.json(role);
    } catch (e) {
        res.status(500).send("failed")
    }
});

export default roles;