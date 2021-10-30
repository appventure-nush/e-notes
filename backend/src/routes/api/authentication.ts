import {Router} from "express";
import {auth, storage} from "firebase-admin";
import {checkUser, updateUser} from "../../utils";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import {User} from "../../types/user";
import imageType from "image-type";
import Jimp from "jimp";

const authentication = Router();

const IMAGE_FORMATS = ['image/gif', 'image/jpeg', 'image/png'];
authentication.post('/', (req, res) => {
    const idToken = req.body.idToken.toString();
    const expiresIn = 1000 * 60 * 60 * 24 * 7;
    auth()
        .createSessionCookie(idToken, {expiresIn})
        .then((sessionCookie) => {
            const options = {maxAge: expiresIn, httpOnly: true, secure: process.env.ENVIRONMENT !== 'local'};
            res.cookie('session', sessionCookie, options);
            res.json({status: 'success'});
        }, _ => {
            res.status(403).send('NZ2XG2D3NRHTS2KOL5TDISKMGNSH2===');
        });
});
authentication.post('/profile', checkUser, async (req, res) => {
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
authentication.post('/pfp', checkUser, async (req, res) => {
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
authentication.get('/logout', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    if (!sessionCookie) return res.redirect("/");
    res.clearCookie('session');
    auth()
        .verifySessionCookie(sessionCookie)
        .then((decodedClaims) => auth().revokeRefreshTokens(decodedClaims.sub))
        .then(_ => res.render('logout', {layout: false}))
        .catch(_ => res.status(403).send('logout failed<br>' + _.message));
});

export default authentication;