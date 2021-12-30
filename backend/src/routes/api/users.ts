import {Router} from 'express';
import {checkAdmin, checkUser, getFBUser, getUser, profileCache, sortHandler, updateUser} from '../../utils';
import {_setPermissions} from "../../types/permissions";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import {error, failed, success} from "../../response";
import {middleware} from "apicache";
import {auth} from "../../app";
import {teachers} from "../../config";

const users = Router();

users.get("/", checkUser, middleware('1 min'), (req, res) => {
    let users = [...profileCache.values()];
    if (!req.user?.admin && !req.user?.teacher) users = users.filter(u => u.teacher);
    res.json(users.sort(sortHandler('uid')));
});

users.get("/:uid", checkUser, async (req, res) => {
    try {
        let user = await getUser(req.params.uid);
        if (req.user?.admin && user) {
            const fbUser = await getFBUser(req.params.uid);
            if (fbUser) user = {
                ...user,
                lastLogin: fbUser.metadata.lastSignInTime,
                created: fbUser.metadata.creationTime
            };
        }
        if (user?.teacher) user = {...user, ...{teacherInfo: teachers.directory.find(t => t.email_stupr === user?.email)}};
        res.json(user);
    } catch (e) {
        res.json(error("failed_to_get_user"));
    }
});

users.post("/:uid", checkUser, checkAdmin, async (req, res) => {
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
        if (typeof req.body.name === 'string') await auth.updateUser(req.params.uid, {displayName: user.name = req.body.name});
        if (typeof req.body.nick === 'string') user.nickname = req.body.nick;
        if (typeof req.body.desc === 'string') user.desc = req.body.desc;

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
        if (needUpdateClaims) await auth.setCustomUserClaims(req.params.uid, claims);

        await updateUser(user.uid, user);
        res.json(success({user}));
        await addAudit(simpleAudit(req.uid!, req.params.rid, Category.USER, Action.EDIT_PERMISSION, [req.body]));
    } catch (e) {
        res.json(error(e.message))
    }
});

export default users;