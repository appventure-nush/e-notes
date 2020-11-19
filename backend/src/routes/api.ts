import {Router} from 'express';

import roles from './roles';
import users from './users';
import collections from './collections';

const api = Router();

api.use("/roles", roles);
api.use("/users", users);
api.use("/collections", collections);

export default api;