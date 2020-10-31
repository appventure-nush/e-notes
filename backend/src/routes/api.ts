import {Router} from 'express';

import collections from './collections';

const api = Router();

api.use("/collections", collections);

export default api;