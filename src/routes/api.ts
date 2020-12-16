import {Request, Response, Router} from 'express';

import roles from './api/roles';
import users from './api/users';
import collections from './api/collections';

const api = Router();

api.use("/roles", roles);
api.use("/users", users);
api.use("/collections", collections);
api.use((err: any, req: Request, res: Response) => {
    res.status(403);
    res.json({reason: 'something happened'});
});
export default api;