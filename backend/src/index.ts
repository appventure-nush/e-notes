import express from "express";
import admin from 'firebase-admin';
import * as bodyParser from 'body-parser';
// @ts-ignore
import NodeVault from 'node-vault';

import apiRouter from "./routes/api"

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use("/api", apiRouter);
app.use('/static', express.static('public'));
app.get("/", (req, res) => res.send("API End Point: /api"));

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

// set up firebase admin with vault
(async () => {
    try {
        return require("service-account.json");
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
    admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
    app.locals.admin = admin;
    (app.locals.db = admin.firestore()).settings({
        ignoreUndefinedProperties: true,
    });
    app.locals.auth = admin.auth();
});