import {Router} from 'express';
import {checkUser} from "../utils";

const audit = Router();

audit.get('/', checkUser, (req, res) => {
    res.render("audits", {
        title: 'Audits',
        user: req.body.user,
        csrf: req.csrfToken()
    });
});

export default audit;