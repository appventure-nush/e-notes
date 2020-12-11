import {Router} from 'express';
import {checkUserOptional} from '../utils';
import admin from 'firebase-admin';
import usersRouter from "./users";
import adminRouter from "./admin";

const index = Router();

index.get('/', checkUserOptional, (req, res) => {
    res.render("index", {user: req.body.user, csrf: req.csrfToken()});
});

index.post('/', (req, res) => {
    const idToken = req.body.idToken.toString();
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    admin.auth()
        .createSessionCookie(idToken, {expiresIn})
        .then((sessionCookie) => {
            const options = {maxAge: expiresIn, httpOnly: true, /*secure: true*/};
            res.cookie('session', sessionCookie, options);
            res.end(JSON.stringify({status: 'success'}));
        }, error => {
            res.status(401).send('UNAUTHORIZED REQUEST!');
        });
});
index.get('/logout', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    res.clearCookie('session');
    admin.auth()
        .verifySessionCookie(sessionCookie)
        .then((decodedClaims) => admin.auth().revokeRefreshTokens(decodedClaims.sub))
        .then(() => res.redirect('/'))
        .catch((error) => res.redirect('/'));
});

index.use("/users", usersRouter);
index.use("/admin", adminRouter);

export default index;