import {NextFunction, Request, Response, Router} from 'express';

import roles from './api/roles';
import users from './api/users';
import audits from './api/audits';
import collections from './api/collections';
import authentication from "./api/authentication";
import {error, success} from "../response";

const api = Router();
api.use((req, res, next) => {
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    next();
});
api.get("", (req, res) => res.json(success({name: "enotes backend", author: "zy", server_time: new Date()})))
api.use("/auth", authentication);
api.use("/roles", roles);
api.use("/users", users);
api.use("/audits", audits);
api.use("/collections", collections);
api.use((err: Error, req: Request, res: Response, next: NextFunction) => res.json(error(err.message)));
export default api;