import {Router} from 'express';
import {checkUserOptional} from "../utils";

const create = Router();

create.get('/', checkUserOptional, (req, res) => {
    res.render("create", {user: req.body.user, csrf: req.csrfToken()});
})

export default create;