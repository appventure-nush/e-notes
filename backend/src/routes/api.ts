import {Router} from 'express';

import roles from './api/roles';
import users from './api/users';
import collections from './api/collections';

const api = Router();

api.use("/roles", roles);
api.use("/users", users);
api.use("/collections", collections);

export default api;