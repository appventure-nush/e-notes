import {Router} from 'express';
import {checkUserOptional, getCollection} from "../utils";

const collection = Router();

collection.get('/', checkUserOptional, (req, res) => {
    res.redirect('/');
});
collection.get('/:cid', checkUserOptional, (req, res) => {
    if (req.originalUrl.endsWith(req.params.cid)) res.redirect(`/c/${req.params.cid}/`);
    else res.render("collection", {user: req.body.user, coll: getCollection(req.params.cid), csrf: req.csrfToken()});
});
collection.get('/:cid/img/:img', checkUserOptional, (req, res) => {
    res.redirect('/images/guest.png');
});
collection.get('/:cid/:nid', checkUserOptional, (req, res) => {
    res.render("collection", {
        user: req.body.user,
        coll: getCollection(req.params.cid),
        nid: req.params.nid,
        csrf: req.csrfToken(),
    });
});

export default collection;