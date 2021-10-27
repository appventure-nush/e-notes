import admin from "firebase-admin";
import {MutablePermissions} from "./permissions";
import UserRecord = admin.auth.UserRecord;

export interface User extends MutablePermissions {
    uid: string;

    nickname?: string;
    desc?: string;
    roles: string[];
    name?: string;
    email?: string;
    pfp?: string;
    verified?: boolean;
    admin: boolean;
    teacher: boolean;
    has_control_over?: string[];
}

export function makeUser(uid: string): User {
    return {admin: false, teacher: false, permissions: {}, roles: [], uid: uid};
}

export function fillUser(user: User, rec: UserRecord): User {
    user.name = rec.displayName;
    user.email = rec.email;
    user.pfp = rec.photoURL;
    user.verified = rec.emailVerified;
    return user;
}