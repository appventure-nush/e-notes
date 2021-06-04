import admin from "firebase-admin";
import {MutablePermissions} from "./permissions";
import UserRecord = admin.auth.UserRecord;

class User extends MutablePermissions {
    uid: string;

    nickname?: string;
    desc?: string;
    roles: string[];
    admin = false;

    name?: string;
    email?: string;
    pfp?: string;
    verified?: boolean;

    constructor(user: string | any) {
        super();
        if (typeof user === 'string') {
            this.uid = user;
            this.roles = [];
            this.permissions = {};
        } else {
            this.uid = user.uid;
            this.nickname = user.nickname;
            this.desc = user.desc;
            this.roles = user.roles;
            this.admin = user.admin;
            this.permissions = user.permissions;
        }
    }

    fill(user: UserRecord) {
        this.name = user.displayName;
        this.email = user.email;
        this.pfp = user.photoURL;
        this.verified = user.emailVerified;
        return this;
    }
}

export default User;