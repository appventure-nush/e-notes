import {Router} from 'express';
import {checkUserOptional} from "../utils";

const user = Router();
// TODO render specified user
user.get('/', checkUserOptional, (req, res) => {
    res.render("users", {title: 'Users', user: req.body.user, csrf: req.csrfToken()});
});

export default user;