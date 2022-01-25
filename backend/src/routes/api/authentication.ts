import {Router} from "express";
import {checkUser, checkUserOptional, filterBadImageUpload, updateUser, userCache} from "../../utils";
import {Action, addAudit, Category, simpleAudit} from "../../types/audit";
import {fillUser, User} from "../../types/user";
import {error, failed, success} from "../../response";
import sharp from "sharp";
import fileUpload from "express-fileupload";
import {auth} from "../../app";
import {USERS_STORE} from "../../storage";
import {PFP_PATH, PFP_URL} from "./users";
import {extname} from "path";

const authentication = Router();
authentication.get('/', checkUserOptional, (req, res) => {
    if (req.user) return res.json(req.user);
    else return res.json(failed("not_logged_in"));
});
authentication.post('/', (req, res) => {
    const token = req.body.token.toString();
    const expiresIn = 1000 * 60 * 60 * 24 * 7;
    auth.createSessionCookie(token, {expiresIn})
        .then((sessionCookie) => {
            res.cookie('session', sessionCookie,
                {maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict'}
            );
            res.json(success());
        }, e => {
            res.json(failed({reason: 'NZ2XG2D3NRHTS2KOL5TDISKMGNSH2===', message: e.message}));
        });
});
authentication.post('/profile', checkUser, async (req, res) => {
    const {nickname, desc} = req.body;
    const user = req.user!;
    if (nickname && typeof nickname === 'string') user.nickname = nickname;
    if (desc && typeof desc === 'string') user.desc = desc;
    try {
        await addAudit(simpleAudit(user.uid, user.uid, Category.USER, Action.EDIT, [{nickname, desc}]));
        return res.json(success({
            user: await updateUser(user.uid, user as User)
        }));
    } catch (e) {
        res.json(error(e.message));
    }
    res.json(failed('not sure why, not sure where'));
});
authentication.post('/pfp', checkUser, fileUpload({limits: {fileSize: 16 * 1024 * 1024}}), filterBadImageUpload, async (req, res) => {
    try {
        const path = PFP_PATH(req.uid!, extname(req.approvedImage!.name));
        await sharp(req.approvedImage!.data).resize(512, 512)
            .pipe(USERS_STORE.write(path));
        const url = PFP_URL(req.uid!, extname(req.approvedImage!.name)) + "?" + Date.now();
        const user = await auth.updateUser(req.uid!, {photoURL: url});
        userCache.set(user.uid, user);
        res.json(success({
            user: fillUser(req.user!, user)
        }));
        await addAudit(simpleAudit(req.uid!, req.uid!, Category.USER, Action.EDIT, [{pfp: url}]));
    } catch (e) {
        res.json(failed('please contact an admin'));
    }
});
authentication.get('/logout', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    if (!sessionCookie) return res.json(success());
    res.clearCookie('session');
    auth
        .verifySessionCookie(sessionCookie)
        .then((decodedClaims) => auth.revokeRefreshTokens(decodedClaims.sub))
        .then(_ => res.json(success()))
        .catch(_ => res.json(error({reason: 'logout failed', message: _.message})));
});

export default authentication;