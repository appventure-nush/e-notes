import {Router} from 'express';
import {checkUserOptional, getUser} from "../utils";

const user = Router();
// TODO render specified user
user.get('/', checkUserOptional, (req, res) => {
    res.render("users", {title: 'Users', user: req.body.user, csrf: req.csrfToken()});
});
user.get('/:uid', checkUserOptional, async (req, res) => {
    const user = await getUser(req.params.uid);
    if (!user) res.redirect('/u');
    else res.render("user", {title: user.name, user, csrf: req.csrfToken()});
});

export default user;