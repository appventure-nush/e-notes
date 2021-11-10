import express, {NextFunction, Request, Response, Router} from 'express';

import roles from './api/roles';
import users from './api/users';
import audits from './api/audits';
import collections from './api/collections';
import authentication from "./api/authentication";
import {error, success} from "../response";
import {checkUserOptional} from "../utils";
import fileUpload from "express-fileupload";

const api = Router();
api.use((req, res, next) => {
    if (req.method === 'GET') res.set('Cache-control', `public, max-age=${60 * 5}`);
    else res.set('Cache-control', `no-store`);
    next()
});
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
api.use((err: Error, req: Request, res: Response) => res.json(error(err.message)));

export default api;