import {NextFunction, Request, Response, Router} from 'express';

import roles from './api/roles';
import users from './api/users';
import audits from './api/audits';
import collections from './api/collections';

const api = Router();
api.use((req, res, next) => {
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    next();
});
api.use("/roles", roles);
api.use("/users", users);
api.use("/audits", audits);
api.use("/collections", collections);
api.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(403).json({reason: 'something happened'});
});
export default api;