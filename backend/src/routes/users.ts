import {Router} from 'express';
import admin from "firebase-admin";

const users = Router();

import {getUser, checkUser, checkAdmin} from '../utils';
import User from "../types/user";

users.get("/", checkUser, async (req, res, next) => req.app.locals.auth.listUsers(1000).then((list: admin.auth.ListUsersResult) => res.json({
    users: list.users.map(user => ({
        uid: user.uid, email: user.email, name: user.displayName, pfp: user.photoURL
    })), token: list.pageToken
})));

users.get("/:uid", checkUser, async (req, res, next) => {
    try {
        if (req.params.uid === 'me') req.params.uid = req.body.cuid;
        const data = await Promise.all([getUser(req.params.uid), req.app.locals.auth.getUser(req.params.uid)]);
        res.json(transformUser(data[0], data[1]));
    } catch (e) {
        res.status(500).send("failed_to_get_user")
    }
});

users.get("/:uid/admin", checkAdmin, async (req, res, next) => {
    try {
        res.json(await Promise.all([getUser(req.params.uid), req.app.locals.auth.getUser(req.params.uid)]));
    } catch (e) {
        res.status(500).send("failed_to_get_user")
    }
});

// { target:'CS3132', to:true}
users.post("/:uid/admin/setperm", checkAdmin, async (req, res, next) => {
    try {
        const user = await getUser(req.params.uid);
        await user.setPermission(req.body.perm, req.body.to);
        res.json(user);
    } catch (e) {
        res.status(500).send("failed")
    }
});

users.post("/:uid/admin/setperms", checkAdmin, async (req, res, next) => {
    try {
        const user = await getUser(req.params.uid);
        await user.setPermissions(req.body);
        res.json(user);
    } catch (e) {
        res.status(500).send("failed")
    }
});

users.post("/:uid/admin/role", checkAdmin, async (req, res, next) => {
    try {
        const user = await getUser(req.params.uid);
        await user.addRole(req.body.rid);
        res.json(user);
    } catch (e) {
        res.status(500).send("failed")
    }
});

function transformUser(user: User, fbUser: admin.auth.UserRecord) {
    const data = user.toData() as any;
    data.email = fbUser.email;
    data.name = fbUser.displayName;
    data.pfp = fbUser.photoURL;
    return data;
}

export default users;