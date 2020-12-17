import csrf from 'csurf';
import morgan from 'morgan';
import NodeVault from 'node-vault';
import admin from 'firebase-admin';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import express, {NextFunction, Request, Response} from "express";

import {setup} from './utils';
import apiRouter from "./routes/api"
import indexRouter from "./routes/index"

import path from "path";

const app = express();
const csrfProtection = csrf({cookie: true});
app.engine('hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload({limits: {fileSize: 8 * 1024 * 1024}}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use("/api", apiRouter);
app.use("/", csrfProtection, indexRouter);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    res.status(403);
    res.send("bWF5YmUgaSBzaG91bGQgZ2l2ZSB5b3UgYSBmbGFn");
});
app.use(express.static(path.join(__dirname, '..', 'public')));

(async () => {
    try {
        return require("../service-account.json");
    } catch (e) {
        const vaultClient = NodeVault({endpoint: "https://vault.nush.app"});
        const secretsClient = NodeVault({
            endpoint: "https://vault.nush.app",
            token: (await vaultClient.userpassLogin({
                username: "enotes",
                password: process.env.VAULT_PASSWORD
            })).auth.client_token
        });
        return (await secretsClient.read("apps/data/enotes")).data.data.service_account;
    }
})().then((serviceAccount: object | admin.ServiceAccount) => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "e-notes-nush.appspot.com"
    });
    setup();
    app.locals.bucket = admin.storage().bucket();
    admin.firestore().settings({ignoreUndefinedProperties: true});
});

export default app;