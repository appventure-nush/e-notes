import {Router} from "express";
import {auth, storage} from "firebase-admin";
import {checkUser, checkUserOptional, updateUser} from "../../utils";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import {User, fillUser} from "../../types/user";
import imageType from "image-type";
import Jimp from "jimp";
import {error, failed, success} from "../../response";

const authentication = Router();

const IMAGE_FORMATS = ['image/gif', 'image/jpeg', 'image/png'];
authentication.get('/', checkUserOptional, (req, res) => {
    if (req.user) return res.json(req.user);
    else return res.json(failed("not_logged_in"));
});
authentication.post('/', (req, res) => {
    const token = req.body.token.toString();
    const expiresIn = 1000 * 60 * 60 * 24 * 7;
    auth()
        .createSessionCookie(token, {expiresIn})
        .then((sessionCookie) => {
            const options = {maxAge: expiresIn, httpOnly: true, secure: process.env.ENVIRONMENT !== 'local'};
            res.cookie('session', sessionCookie, options);
            res.json(success());
        }, _ => {
            res.json(failed({reason: 'NZ2XG2D3NRHTS2KOL5TDISKMGNSH2===', message: _.message}));
        });
});
authentication.post('/profile', checkUser, async (req, res) => {
    const {nickname, desc} = req.body;
    const user = req.user;
    if (nickname || typeof nickname === 'string') user.nickname = nickname;
    if (desc || typeof nickname === 'string') user.desc = desc;
    try {
        if (nickname || desc || typeof nickname === 'string' || typeof nickname === 'string') {
            await addAudit(simpleAudit(user.uid, user.uid, Category.USER, Action.EDIT, [{nickname, desc}]));
            return res.json(success({
                user: await updateUser(user.uid, user as User)
            }));
        } else return res.json(failed('please give a nickname or a description'));
    } catch (e) {
        // await error("profile change error", {message: e.message, body: req.body, uid: user.uid});
    }
    res.json(failed('not sure why, not sure where'));
});
authentication.post('/pfp', checkUser, async (req, res) => {
    if (!req.files) return res.json(failed('where is the file'));
    const new_profile_pic = req.files.new_profile_pic;
    if (new_profile_pic && "data" in new_profile_pic) {
        const type = imageType(new_profile_pic.data);
        if (type && type.mime.toUpperCase() === new_profile_pic.mimetype.toUpperCase()) {
            if (IMAGE_FORMATS.includes(type.mime.toLowerCase())) try {
                const file = storage().bucket().file(`users/pfp/${req.uid}.${type.ext}`);
                await file.save(await (await Jimp.read(new_profile_pic.data)).cover(256, 256).quality(80).getBufferAsync('image/jpeg'), {resumable: false});
                const url = (await file.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2500'
                }))[0];
                res.json(success({
                    user: fillUser(req.user, await auth().updateUser(req.uid, {photoURL: url}))
                }));
                await addAudit(simpleAudit(req.uid, req.uid, Category.USER, Action.EDIT, [{pfp: url}]));
            } catch (e) {
                res.json(failed('please contact an admin'));
            } else return res.json(failed('only gif/jpg/png allowed!'));
        } else return res.json(failed('i like your funny words, magic man'));
    } else return res.json(failed('where is the file'));
});
authentication.get('/logout', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    if (!sessionCookie) return res.redirect("/");
    res.clearCookie('session');
    auth()
        .verifySessionCookie(sessionCookie)
        .then((decodedClaims) => auth().revokeRefreshTokens(decodedClaims.sub))
        .then(_ => res.json(success()))
        .catch(_ => res.json(error({reason: 'logout failed', message: _.message})));
});

export default authentication;