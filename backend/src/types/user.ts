import {auth, firestore} from "firebase-admin";
import {updateUser} from '../utils';

class User {
    uid: string;
    ref: firestore.DocumentReference;

    nickname?: string;
    roles: string[];
    admin = false;
    permissions: Map<string, boolean>;

    constructor(user: auth.UserRecord) {
        this.uid = user.uid;
        this.ref = firestore().collection("users").doc(this.uid);
        this.roles = [];
        this.permissions = new Map<string, boolean>();
    }

    async setNickname(nickname: string) {
        this.nickname = nickname;
        await updateUser(this.uid, this);
    }

    async setPermission(cid: string, accepts: boolean) {
        if (typeof accepts === 'undefined') this.permissions.delete(cid);
        this.permissions.set(cid, accepts);
        await updateUser(this.uid, this);
    }

    accepts(cid: string) {
        return this.permissions.has(cid) && this.permissions.get(cid);
    }

    rejects(cid: string) {
        return this.permissions.has(cid) && this.permissions.get(cid) === false;
    }
}

export default User;