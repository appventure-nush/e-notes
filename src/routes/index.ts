import {Router} from 'express';
import {checkUser, checkUserOptional} from '../utils';
import {auth} from 'firebase-admin';
import userRouter from "./users";
import roleRouter from "./roles";
import collRouter from "./collections";
import profileRouter from "./profile";

const index = Router();

index.get('/', checkUser, (req, res) => {
    res.render("index", {title: 'Notes', user: req.body.user, csrf: req.csrfToken(), logout: req.query.logout});
});

index.get('/login', checkUserOptional, (req, res) => {
    if (req.body.user) res.redirect('/'); // why just why
    else res.render("login", {title: 'Login', csrf: req.csrfToken(), layout: false});
});

index.get('/logout', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    res.clearCookie('session');
    auth()
        .verifySessionCookie(sessionCookie)
        .then((decodedClaims) => auth().revokeRefreshTokens(decodedClaims.sub))
        .then(_ => res.render('logout', {layout: false}))
        .catch(_ => res.status(403).send('logout failed'));
});

index.post('/', (req, res) => {
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

index.use("/u", userRouter);
index.use("/c", collRouter);
index.use("/r", roleRouter);
index.use("/profile", profileRouter);

export default index;