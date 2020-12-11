import Jimp from 'jimp';
import {Router} from 'express';
import {checkUser, getUser, transformUser} from "../utils";
import imageType from "image-type";
import {auth, storage} from "firebase-admin";
import User from "../types/user";

const profile = Router();
const IMAGE_FORMATS = ['image/gif', 'image/jpeg', 'image/png'];
profile.get('/', checkUser, (req, res) => {
    res.render("profile", {user: req.body.user, csrf: req.csrfToken()});
});
profile.post('/uploadPFP', checkUser, async (req, res) => {
    if (!req.files) return res.json({status: 'failed', reason: 'where is the file'});
    let new_profile_pic = req.files.new_profile_pic;
    if (new_profile_pic && "data" in new_profile_pic) {
        let type = imageType(new_profile_pic.data);
        if (type && type.mime.toUpperCase() === new_profile_pic.mimetype.toUpperCase()) {
            if (IMAGE_FORMATS.includes(type.mime.toLowerCase())) {
                try {
                    let file = storage().bucket().file(`users/pfp/${req.body.cuid}.${type.ext}`);
                    await file.save(new Uint8Array(await (await Jimp.read(new_profile_pic.data)).cover(256, 256).quality(80).getBufferAsync(type.mime)), {resumable: false});
                    let url = (await file.getSignedUrl({
                        action: 'read',
                        expires: '01-01-2500'
                    }))[0];
                    res.json({
                        status: 'success',
                        user: transformUser(new User(req.body.user), await auth().updateUser(req.body.cuid, {photoURL: url}))
                    });
                } catch (e) {
                    console.log(e);
                    res.json({status: 'failed', reason: 'please contact an admin'});
                }
            } else return res.json({status: 'failed', reason: 'only gif/jpg/png allowed!'});
        } else return res.json({status: 'failed', reason: 'i like your funny words, magic man'});
    } else return res.json({status: 'failed', reason: 'where is the file'});
});

export default profile;