import express from 'express';

import roles from './api/roles';
import users from './api/users';
import audits from './api/audits';
import collections from './api/collections';
import authentication from "./api/authentication";
import {error, success} from "../response";
import {checkUserOptional} from "../utils";
import nocache from "nocache";
import os from "os";
import adminRoute from "./api/admin";
import * as fs from "fs";
import moment from "moment";

const api = express.Router();
api.use(nocache());
api.use(express.json());
api.use(express.urlencoded({extended: true}));

api.get("/", checkUserOptional, (req, res) => {
    const freeRam = os.freemem(), total = os.totalmem();
    res.json(success({
        name: "enotes api",
        credits: "zhao yun",
        logged_in_as: req.user?.email,
        ip: req.ip,
        ips: req.ips || req.socket.remoteAddress,
        server_time: Date.now(),
        server_uptime: os.uptime(),
        cpus: os.cpus().length,
        memory: {
            free: freeRam,
            total: total,
            usage: 1 - freeRam / total
        }
    }));
})
api.get("/csrf", (req, res) => res.json({token: req.csrfToken()}));
api.use("/auth", authentication);
api.use("/roles", roles);
api.use("/users", users);
api.use("/audits", audits);
api.use("/collections", collections);
api.use("/admin", adminRoute);


api.get("/test/file", (req, res) => {
    fs.appendFileSync("/data/test.txt", moment().format("HH:mm:ss") + "\n");
    res.send(fs.readFileSync("/data/test.txt").toString());
});
api.get("/test/io", (req, res) => {
    try {
        let dir = fs.mkdtempSync("/data/io-test");
        let result = {
            readManyFiles: 0,
            writeManyFiles: 0,
            readLargeFile: 0,
            writeLargeFile: 0
        }
        const count = (req.query.amount && parseInt(req.query.amount.toString(), 10)) || 100;

        let time = Date.now();
        for (let i = 0; i < count; i++) {
            fs.writeFileSync(dir + "/" + i, "0".repeat(1024 * 1024)); // 1 mb files
        }
        result.writeManyFiles = 1000 * (Date.now() - time) / count;
        time = Date.now();
        for (let i = 0; i < count; i++) {
            fs.readFileSync(dir + "/" + i);
        }
        result.readManyFiles = 1000 * (Date.now() - time) / count;

        time = Date.now();
        fs.writeFileSync(dir + "/big", "0".repeat(100 * 1024 * 1024));  // 100 mb files
        result.writeLargeFile = 1000 * (Date.now() - time) / 100;

        time = Date.now();
        fs.readFileSync(dir + "/big");
        result.readLargeFile = 1000 * (Date.now() - time) / 100;
        res.send(`
        Reading Large File: ${result.readLargeFile.toFixed(6)} MB/s<br>
        Writing Large File: ${result.writeLargeFile.toFixed(6)} MB/s<br>
        Reading Many Files: ${result.readManyFiles.toFixed(6)} MB/s<br>
        Writing Many File: ${result.writeManyFiles.toFixed(6)} MB/s`);
        fs.rmdirSync(dir, {recursive: true});
    } catch (e) {
        res.send(e.toString());
    }
});

api.get('*', (req, res) => res.json(error("404")));
api.use((err: Error, req: express.Request, res: express.Response) => {
    res.json(error(err.message));
});

export default api;