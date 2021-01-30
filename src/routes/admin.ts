import {Router} from 'express';
import {checkAdmin} from "../utils";

const admin = Router();

admin.get('/', checkAdmin, (req, res) => {
    res.render("admin", {title: 'Admin', user: req.body.user, csrf: req.csrfToken()});
})

export default admin;