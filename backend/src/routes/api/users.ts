import {Router} from 'express';
import {auth, storage} from "firebase-admin";
import {checkAdmin, checkUser, getUser, updateUser} from '../../utils';
import {_setPermissions} from "../../types/permissions";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import {User} from "../../types/user";
import imageType from "image-type";
import Jimp from "jimp";

const users = Router();
const IMAGE_FORMATS = ['image/gif', 'image/jpeg', 'image/png'];

users.get("/", checkUser, async (req, res) => auth().listUsers(1000).then((list: auth.ListUsersResult) => res.json({
    users: list.users.map(user => ({
        uid: user.uid, email: user.email, name: user.displayName, pfp: user.photoURL || ""
    })), token: list.pageToken
})));


users.post('/me', checkUser, async (req, res) => {
    const {nickname, desc} = req.body;
    const user = req.body.user;
    if (nickname || typeof nickname === 'string') user.nickname = nickname;
    if (desc || typeof nickname === 'string') user.desc = desc;
    try {
        if (nickname || desc || typeof nickname === 'string' || typeof nickname === 'string') {
            await addAudit(simpleAudit(user.uid, user.uid, Category.USER, Action.EDIT, [{nickname, desc}]));
            return res.json({
                status: 'success',
                user: await updateUser(user.uid, user as User)
            });
        } else return res.json({status: 'failed', reason: 'please give a nickname or a description'});
    } catch (e) {
        // await error("profile change error", {message: e.message, body: req.body, uid: user.uid});
    }
    res.json({status: 'failed', reason: 'not sure why, not sure where'});
});
users.post('/me/pfp', checkUser, async (req, res) => {
    if (!req.files) return res.json({status: 'failed', reason: 'where is the file'});
    const new_profile_pic = req.files.new_profile_pic;
    if (new_profile_pic && "data" in new_profile_pic) {
        const type = imageType(new_profile_pic.data);
        if (type && type.mime.toUpperCase() === new_profile_pic.mimetype.toUpperCase()) {
            if (IMAGE_FORMATS.includes(type.mime.toLowerCase())) try {
                const file = storage().bucket().file(`users/pfp/${req.body.cuid}.${type.ext}`);
                await file.save(await (await Jimp.read(new_profile_pic.data)).cover(256, 256).quality(80).getBufferAsync('image/jpeg'), {resumable: false});
                const url = (await file.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2500'
                }))[0];
                res.json({
                    status: 'success',
                    user: req.body.user.fill(await auth().updateUser(req.body.cuid, {photoURL: url}))
                });
                await addAudit(simpleAudit(req.body.cuid, req.body.cuid, Category.USER, Action.EDIT, [{pfp: url}]));
            } catch (e) {
                res.json({status: 'failed', reason: 'please contact an admin'});
            } else return res.json({status: 'failed', reason: 'only gif/jpg/png allowed!'});
        } else return res.json({status: 'failed', reason: 'i like your funny words, magic man'});
    } else return res.json({status: 'failed', reason: 'where is the file'});
});

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
        if (Array.isArray(req.body.roles)) {
            await addAudit(simpleAudit(req.body.cuid, req.params.rid, Category.ROLE, Action.EDIT_ROLES, [{
                "old": user.roles,
                "new": user.roles = Array.from(req.body.roles).map(el => String(el))
            }], {users: [user.uid]}));
        }
        if (typeof req.body.admin === 'boolean') user.admin = req.body.admin;
        if (typeof req.body.permissions === 'object') _setPermissions(user, req.body.permissions);
        await updateUser(user.uid, user);
        res.json(user);
        await addAudit(simpleAudit(req.body.cuid, req.params.rid, Category.USER, Action.EDIT_PERMISSION, [req.body]));
    } catch (e) {
        res.status(500).send("failed")
    }
});

export default users;