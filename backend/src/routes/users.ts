import {Router} from 'express';
import {checkUserOptional} from "../utils";

const users = Router();

users.get('/', checkUserOptional, (req, res) => {
    res.render("users", {user: req.body.user, csrf: req.csrfToken()});
});

export default users;