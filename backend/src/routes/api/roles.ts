import {Router} from 'express';
import {makeRole} from '../../types/role';
import {
    checkAdmin,
    checkUser, profileCache, roleCache, sortHandler,
    updateRole,
    updateUser
} from '../../utils';
import {_setPermissions} from "../../types/permissions";
import {User} from "../../types/user";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import {failed, success} from "../../response";

const roles = Router();

roles.get("/", checkUser, (req, res) => res.json(roleCache.values().sort(sortHandler('rid'))));

roles.get("/:rid", checkUser, (req, res) => {
    const role = roleCache.get(req.params.rid);
    if (!role) return res.json(failed({
        reason: "role_not_found",
        rid: req.params.rid
    }))
    else res.json(role);
});

roles.get("/:rid/users", checkUser, (req, res) => {
    return res.json(profileCache.values().filter(u => u.roles.includes(req.params.rid)).sort(sortHandler('uid')).map(u => u.uid));
});

roles.post("/:rid/users", checkUser, checkAdmin, async (req, res) => {
    let foundUsers: User[] = [];
    if (req.body.uids) foundUsers = (req.body.uids as string[]).map(e => profileCache.get(e)).filter(u => Boolean(u)) as User[];
    if (req.body.emails) foundUsers = (req.body.emails as string[]).map(e => profileCache.values().find(u => u.email === e)).filter(u => Boolean(u)) as User[];
    if (foundUsers.length === 0) res.json(failed({
        reason: "no users specified",
        rid: req.params.rid
    })); else {
        let updated = 0;
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
        res.json(success({
            updated,
            users: result
        }));
        await addAudit(simpleAudit(req.uid!, req.params.rid, Category.ROLE, Action.EDIT_ROLES, ["grant_roles"], {users: foundUsers.map(u => u.uid)}));
    }
});

roles.delete("/:rid", checkUser, checkAdmin, async (req, res) => {
    const role = roleCache.get(req.params.rid);
    if (!role) return res.json(failed({
        reason: "role_not_found",
        rid: req.params.rid
    }));
    else {
        await updateRole(req.params.rid, undefined);
        await addAudit(simpleAudit(req.uid!, req.params.rid, Category.ROLE, Action.DELETE, [role]));
        res.json(success());
    }
});

roles.post("/:rid", checkUser, checkAdmin, async (req, res) => {
    if (!req.body.name) return res.json(failed({
        reason: "name_required_for_creation",
        rid: req.params.rid
    }));
    if (roleCache.has(req.params.rid)) return res.json(failed({
        reason: "role_already_exists",
        rid: req.params.rid
    }));
    if (req.body.rid !== req.params.rid) return res.json(failed({
        reason: "huh",
        rid: req.params.rid
    }));
    else {
        const role = makeRole(req.body.rid, req.body.name, req.body.desc, req.body.defaultPerm);
        _setPermissions(role, req.body.permissions);
        await updateRole(role.rid, role);
        res.json(success({role}));
        await addAudit(simpleAudit(req.uid!, req.params.rid, Category.ROLE, Action.CREATE));
    }
});

roles.post("/:rid/admin", checkUser, checkAdmin, async (req, res) => {
    try {
        const role = roleCache.get(req.params.rid);
        if (!role) return res.json(failed({
            reason: "role_not_found",
            rid: req.params.rid
        }));
        if (typeof req.body.defaultPerm === 'boolean') role.defaultPerm = req.body.defaultPerm;
        if (typeof req.body.permissions === 'object') _setPermissions(role, req.body.permissions);
        if (typeof req.body.name === 'string') role.name = req.body.name;
        if (typeof req.body.desc === 'string') role.desc = req.body.desc;
        await updateRole(role.rid, role);
        res.json(success({role}));
        await addAudit(simpleAudit(req.uid!, req.params.rid, Category.ROLE, Action.EDIT_PERMISSION, [req.body]));
    } catch (e) {
        res.send(failed(e.message))
    }
});

export default roles;