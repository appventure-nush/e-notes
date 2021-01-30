import {Router} from 'express';
import {checkUser} from "../utils";

const role = Router();

role.get('/', checkUser, (req, res) => res.render("roles", {
    title: 'Roles',
    user: req.body.user,
    csrf: req.csrfToken()
}));
role.get('/:rid', checkUser, async (req, res) => res.render("roles", {
    title: 'Roles',
    show: req.params.rid,
    user: req.body.user,
    csrf: req.csrfToken()
}));

export default role;