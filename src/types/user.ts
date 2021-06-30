import admin from "firebase-admin";
import {MutablePermissions} from "./permissions";
import {firestore} from "firebase-admin/lib/firestore";
import UserRecord = admin.auth.UserRecord;
import DocumentData = firestore.DocumentData;

export class User extends MutablePermissions {
    uid: string;

    nickname?: string;
    desc?: string;
    roles: string[];
    admin = false;

    name?: string;
    email?: string;
    pfp?: string;
    verified?: boolean;
}

export function makeUser(uid: string): User {
    let user = new User();
    user.uid = uid;
    user.roles = [];
    user.permissions = {};
    return user;
}

export function toUser(obj: DocumentData): User {
    return obj as User;
}

export function fillUser(user: User, rec: UserRecord): User {
    user.name = rec.displayName;
    user.email = rec.email;
    user.pfp = rec.photoURL;
    user.verified = rec.emailVerified;
    return user;
}