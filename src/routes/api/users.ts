import {Router} from 'express';
import {auth} from "firebase-admin";
import {checkAdmin, checkUser, getUser, updateUser} from '../../utils';
import {_setPermissions} from "../../types/permissions";

const users = Router();

users.get("/", checkUser, async (req, res) => auth().listUsers(1000).then((list: auth.ListUsersResult) => res.json({
    users: list.users.map(user => ({
        uid: user.uid, email: user.email, name: user.displayName, pfp: user.photoURL || ""
    })), token: list.pageToken
})));

users.get("/:uid", checkUser, async (req, res) => {
    try {
        if (req.params.uid === 'me') res.json(req.body.user);
        else res.json(await getUser(req.params.uid));
    } catch (e) {
        res.status(500).send("failed_to_get_user")
    }
});

users.post("/:uid/admin", checkAdmin, async (req, res) => {
    try {
        const user = await getUser(req.params.uid);
        if (!user) return res.status(404).json({
            reason: "user_not_found",
            rid: req.params.uid
        });
        if (Array.isArray(req.body.roles)) user.roles = Array.from(req.body.roles).map(el => String(el));
        if (typeof req.body.admin === 'boolean') user.admin = req.body.admin;
        if (typeof req.body.permissions === 'object') _setPermissions(user, req.body.permissions);
        await updateUser(user.uid, user);
        res.json(user);
    } catch (e) {
        res.status(500).send("failed")
    }
});

export default users;