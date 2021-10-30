import {Router} from 'express';
import {auth} from "firebase-admin";
import {checkAdmin, checkUser, getUser, updateUser} from '../../utils';
import {_setPermissions} from "../../types/permissions";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import {error, failed, success} from "../../response";

const users = Router();

users.get("/", checkUser, async (req, res) => auth().listUsers(1000).then((list: auth.ListUsersResult) => res.json({
    users: list.users.map(user => ({
        uid: user.uid, email: user.email, name: user.displayName, pfp: user.photoURL || ""
    })), token: list.pageToken
})));

users.get("/:uid", checkUser, async (req, res) => {
    try {
        if (req.params.uid === 'me') res.json(req.user);
        else res.json(await getUser(req.params.uid));
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
            await addAudit(simpleAudit(req.uid, req.params.rid, Category.ROLE, Action.EDIT_ROLES, [{
                "old": user.roles,
                "new": user.roles = Array.from(req.body.roles).map(el => String(el))
            }], {users: [user.uid]}));
        }
        if (typeof req.body.permissions === 'object') _setPermissions(user, req.body.permissions);
        await updateUser(user.uid, user);
        res.json(user);
        await addAudit(simpleAudit(req.uid, req.params.rid, Category.USER, Action.EDIT_PERMISSION, [req.body]));
    } catch (e) {
        res.json(error(e.message))
    }
});
users.post("/:uid/admin", checkAdmin, async (req, res) => {
    try {
        const user = await getUser(req.params.uid);
        if (!user) return res.json(failed({
            reason: "user_not_found",
            rid: req.params.uid
        }));
        let claims = {
            admin: user.admin,
            access: user.access
        }
        claims.admin = user.admin = req.body.admin;
        claims.access = user.access = req.body.access;
        await updateUser(req.params.uid, user);
        await auth().setCustomUserClaims(req.params.uid, claims);
        res.json(success({user}));
    } catch (e) {
        res.json(error(e.message))
    }
});

export default users;