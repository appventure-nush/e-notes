import {Router} from 'express';
import {checkUserOptional, getCollection, hasPermissions} from "../utils";

const collection = Router();

collection.get('/', checkUserOptional, (req, res) => {
    res.redirect('/');
});
collection.get('/:cid', checkUserOptional, async (req, res) => {
    if (req.originalUrl.endsWith(req.params.cid)) return res.redirect(`/c/${req.params.cid}/`);
    else {
        let hasPerm = await hasPermissions(req.body.cuid, req.params.cid);
        let coll = getCollection(req.params.cid);
        if (hasPerm && coll) {
            res.render("collection", {
                user: req.body.user,
                coll: coll,
                csrf: req.csrfToken()
            });
        } else res.redirect('/');
    }
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