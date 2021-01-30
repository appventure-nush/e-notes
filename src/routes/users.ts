import {Router} from 'express';
import {checkUser, checkUserOptional} from "../utils";

const user = Router();
user.get('/', checkUser, (req, res) => res.render("users", {
    title: 'Users',
    user: req.body.user,
    csrf: req.csrfToken()
}));
user.get('/:uid', checkUser, async (req, res) => res.render("users", {
    title: 'Users',
    show: req.params.uid,
    user: req.body.user,
    csrf: req.csrfToken()
}));

export default user;