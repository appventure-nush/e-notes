import {Router} from 'express';
import {checkAdmin, checkUser, getUser, getUsers, updateUser} from '../../utils';
import {_setPermissions} from "../../types/permissions";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import {error, failed, success} from "../../response";
import {auth} from "firebase-admin";
import {middleware} from "apicache";

const users = Router();

users.get("/", checkUser, middleware('1 min'), (req, res) => {
    Promise.all(getUsers().map(u => getUser(u.uid))).then(u => res.json(u));
});

users.get("/:uid", checkUser, async (req, res) => {
    try {
        res.json(await getUser(req.params.uid));
    } catch (e) {
        res.send("failed_to_get_user")
    }
});

users.post("/:uid", checkAdmin, async (req, res) => {
    try {
        const user = await getUser(req.params.uid);
        if (!user) return res.json(failed({
            reason: "user_not_found",
            rid: req.params.uid
        }));
        if (Array.isArray(req.body.roles)) {
            await addAudit(simpleAudit(req.uid!, req.params.rid, Category.ROLE, Action.EDIT_ROLES, [{
                "old": user.roles,
                "new": user.roles = [...new Set(Array.from(req.body.roles).map(el => String(el)))]
            }], {users: [user.uid]}));
        }
        if (typeof req.body.permissions === 'object') _setPermissions(user, req.body.permissions);

        if (typeof req.body.teacher === 'boolean') user.teacher = req.body.teacher;
        if (typeof req.body.name === 'string') await auth().updateUser(req.params.uid, {displayName: user.name = req.body.name});
        if (typeof req.body.nick === 'string') user.nickname = req.body.nick;

        let claims = {
            admin: user.admin,
            access: user.access
        }
        let needUpdateClaims = false;
        if (typeof req.body.admin === 'boolean') {
            claims.admin = user.admin = req.body.admin;
            needUpdateClaims = true;
        }
        if (typeof req.body.access === 'number') {
            claims.access = user.access = req.body.access;
            needUpdateClaims = true;
        }
        if (needUpdateClaims) await auth().setCustomUserClaims(req.params.uid, claims);

        await updateUser(user.uid, user);
        res.json(success({user}));
        await addAudit(simpleAudit(req.uid!, req.params.rid, Category.USER, Action.EDIT_PERMISSION, [req.body]));
    } catch (e) {
        res.json(error(e.message))
    }
});

export default users;