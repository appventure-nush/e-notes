import {Router} from 'express';

import roles from './roles';
import collections from './collections';

const api = Router();

api.use("/roles", roles);
api.use("/collections", collections);

export default api;