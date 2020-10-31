import express from "express";
import admin from 'firebase-admin';
import * as bodyParser from 'body-parser';

import apiRouter from "./routes/api"

const app = express();
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});
const port = process.env.PORT || 8080;
app.locals.db = admin.firestore();

app.use(bodyParser.json());
app.use("/api", apiRouter);
app.get("/", (req, res) => res.send("API End Point: /api"));

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});