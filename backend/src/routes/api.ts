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
api.get('*', (req, res) => res.json(error("404")));
api.use((err: Error, req: express.Request, res: express.Response) => {
    res.json(error(err.message));
});

export default api;