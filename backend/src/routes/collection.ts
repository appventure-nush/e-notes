import {Router} from 'express';
import {checkUserOptional} from "../utils";

const collection = Router();

collection.get('/', checkUserOptional, (req, res) => {
    res.render("collection", {user: req.body.user, csrf: req.csrfToken()});
})

export default collection;