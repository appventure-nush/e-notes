import {Router} from 'express';
import admin from "firebase-admin";

const users = Router();

import {getUser, checkUser} from '../utils';
import User from "../types/user";

users.get("/", checkUser, async (req, res, next) => req.app.locals.auth.listUsers(1000).then((list: admin.auth.ListUsersResult) => res.json({
    users: list.users.map(user => ({
        uid: user.uid, email: user.email, name: user.displayName, pfp: user.photoURL
    })), token: list.pageToken
})));

users.get("/:uid", checkUser, async (req, res, next) => {
    try {
        if (req.params.uid === 'me') req.params.uid = req.body.uid;
        const data = await Promise.all([getUser(req.params.uid), req.app.locals.auth.getUser(req.params.uid)]);
        res.json(transformUser(data[0], data[1]));
    } catch (e) {
        res.status(500).send("failed_to_get_user")
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