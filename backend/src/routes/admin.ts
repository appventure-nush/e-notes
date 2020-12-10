import {Router} from 'express';

const admin = Router();

admin.get('/', ((req, res) => {
    res.render("admin");
}))

export default admin;