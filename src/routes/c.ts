import {Router} from 'express';
import {checkUserOptional, getCollection} from "../utils";

const collection = Router();

collection.get('/', checkUserOptional, (req, res) => {
    res.redirect('/');
})
collection.get('/:cid', checkUserOptional, (req, res) => {
    res.render("collection", {user: req.body.user, coll: getCollection(req.params.cid), csrf: req.csrfToken()});
})

export default collection;