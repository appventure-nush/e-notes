import {Router} from "express";
import {checkAdmin, checkUser} from "../../utils";
import {db} from "../../app";
import {teachers} from "../../config";
import {COLLECTION_IMAGE_STORE, COLLECTION_NOTES_STORE, USERS_STORE} from "../../storage";
import {error} from "../../response";

const adminRoute = Router();
adminRoute.get("/", checkUser, checkAdmin, (req, res) => res.json(teachers));
adminRoute.get("/mapping", checkUser, checkAdmin, (req, res) => res.json({
    images: COLLECTION_IMAGE_STORE._index,
    notes: COLLECTION_NOTES_STORE._index,
    users: USERS_STORE._index
}))
adminRoute.post("/prune", checkUser, checkAdmin, (req, res) => {
    Promise.all([COLLECTION_IMAGE_STORE.prune(), COLLECTION_NOTES_STORE.prune(), USERS_STORE.prune()]).then(r => res.json(r)).catch(e => res.json(error(e)));
})
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