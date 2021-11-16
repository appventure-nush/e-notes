import express from 'express';

import roles from './api/roles';
import users from './api/users';
import audits from './api/audits';
import collections from './api/collections';
import authentication from "./api/authentication";
import {error, success} from "../response";
import {checkUserOptional} from "../utils";
import fileUpload from "express-fileupload";
import nocache from "nocache";

const api = express.Router();
api.use(nocache());
api.use(express.json());
api.use(express.urlencoded({extended: true}));
api.use(fileUpload({limits: {fileSize: 64 * 1024 * 1024}}));

api.get("/", checkUserOptional, (req, res) => res.json(success({
    name: "enotes api",
    author: "zhao yun",
    server_time: new Date(),
    client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    logged_in_as: req.user ? req.user : "not_logged_in"
})))
api.get("/csrf", (req, res) => res.json({token: req.csrfToken()}));
api.use("/auth", authentication);
api.use("/roles", roles);
api.use("/users", users);
api.use("/audits", audits);
api.use("/collections", collections);
api.get('*', (req, res) => res.json(error("404")));
api.use((err: Error, req: express.Request, res: express.Response) => {
    res.send(err.message);
});

export default api;