import {Router} from 'express';

const index = Router();

index.get('/', ((req, res) => {
    res.render("index");
}))

export default index;