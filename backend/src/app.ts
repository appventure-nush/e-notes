import csrf from 'csurf';
import morgan from 'morgan';
import NodeVault from 'node-vault';
import admin from 'firebase-admin';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import express, {NextFunction, Request, Response} from "express";
import {setup} from './utils';
import apiRouter from "./routes/api"
import collectionRouter from "./routes/collection"
import path from "path";

import compression from "compression";

import history from "connect-history-api-fallback";
import {createProxyMiddleware} from "http-proxy-middleware";

const app = express();
app.use(compression());
app.use(cookieParser());
app.use(csrf({cookie: true}));
if (process.env.NODE_ENV !== 'production')
    app.use(morgan('dev'));

app.use("/api",
    express.json(),
    express.urlencoded({extended: true}),
    fileUpload({limits: {fileSize: 64 * 1024 * 1024}}),
    apiRouter);
app.use("/collection", collectionRouter);

if (process.env.NODE_ENV === 'production') app.use("/", history({
    verbose: true
})); else app.use('/', createProxyMiddleware({target: 'http://localhost:8090', changeOrigin: true}));
app.use(express.static(path.join(__dirname, '..', 'public'), {maxAge: 31557600}));
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    res.status(403).send("bWF5YmUgaSBzaG91bGQgZ2l2ZSB5b3UgYSBmbGFn");
});

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
})().then(async (serviceAccount: object | admin.ServiceAccount) => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "e-notes-nush.appspot.com"
    });
    admin.firestore().settings({ignoreUndefinedProperties: true});
    app.locals.bucket = admin.storage().bucket();
    let listeners = setup();
    setInterval(() => {
        listeners.forEach(e => e());
        listeners = setup();
    }, 60 * 60 * 24 * 1000);
});

export default app;