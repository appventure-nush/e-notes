import {Router} from 'express';

const users = Router();

users.get('/', ((req, res) => {
    res.render("users");
}))

export default users;