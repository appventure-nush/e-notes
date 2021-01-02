import {Router} from 'express';
import {checkUserOptional} from "../utils";

const admin = Router();

admin.get('/', checkUserOptional, (req, res) => {
    res.render("admin", {title: 'Admin', user: req.body.user, csrf: req.csrfToken()});
})

export default admin;