import {Router} from "express";
import {checkAdmin, checkUser} from "../../utils";
import {db} from "../../app";
import {teachers} from "../../config";

const adminRoute = Router();
adminRoute.get("/", checkUser, checkAdmin, (req, res) => res.json(teachers));
adminRoute.post("/directory", checkUser, checkAdmin, (req, res) => {
    let flag = false;
    const teachersRef = db.collection('config').doc('teachers');
    if (req.body.data && Array.isArray(req.body.data)) {
        teachers.directory = req.body.data;
        flag = true;
    } else if (Array.isArray(req.body)) {
        teachers.directory = req.body;
        flag = true;
    }
    if (flag) teachersRef.update(teachers).then(null);
    res.json(teachers);
});
export default adminRoute;