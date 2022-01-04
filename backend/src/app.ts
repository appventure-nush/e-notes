import csrf from 'csurf';
import morgan from 'morgan';
import NodeVault from 'node-vault';
import admin from 'firebase-admin';
import cookieParser from 'cookie-parser';
import express from "express";
import {setup} from './utils';
import apiRouter from "./routes/api"
import rawRouter from "./routes/raw"
import collectionRouter from "./routes/collection"
import path from "path";

import compression from "compression";

import history from "connect-history-api-fallback";
import {createProxyMiddleware} from "http-proxy-middleware";
import {error} from "./response";
import _firestore from "@google-cloud/firestore";

const app = express();
app.use(compression());
app.use(cookieParser());
app.use(csrf({cookie: true}));
if (process.env.NODE_ENV !== 'production')
    app.use(morgan('dev'));

app.use("/api", apiRouter);
app.use("/raw", rawRouter);
app.use("/collection", collectionRouter);
if (process.env.NODE_ENV === 'production') app.use("/", history({
    rewrites: [
        {from: /^\/login(\?.*)?/, to: context => '/login.html' + (context.match[1] || '')},
        {from: /^\/email(\?.*)?/, to: context => '/email.html' + (context.match[1] || '')}
    ]
}));
else app.use('/', createProxyMiddleware({target: 'http://localhost:8090', changeOrigin: true})); // local testing

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.code !== 'EBADCSRFTOKEN') return next();
    res.status(403).json(error({reason: "csrf error", code: "bWF5YmUgaSBzaG91bGQgZ2l2ZSB5b3UgYSBmbGFn"}));
});
app.use(express.static(path.join(__dirname, '..', 'public'), {maxAge: 31557600}));

export let db: _firestore.Firestore;
export let auth: admin.auth.Auth;
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
    db = admin.firestore();
    auth = admin.auth();
    let listeners = setup();
    setInterval(() => {
        listeners.forEach(e => e());
        listeners = setup();
    }, 60 * 60 * 24 * 1000);
});

export default app;