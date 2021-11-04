import admin from "firebase-admin";
import {MutablePermissions} from "./permissions";
import UserRecord = admin.auth.UserRecord;

export const CREATE_COLLECTION = 0b0001;
export const VIEW_OTHER_COLLECTION = 0b0010;
export const EDIT_OTHER_COLLECTION = 0b0100;
export const DELETE_OTHER_COLLECTION = 0b1000;

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
    access?: number;
    teacher: boolean;
    has_control_over?: string[];
}

export function makeUser(uid: string): User {
    return {admin: false, teacher: false, permissions: {}, roles: [], uid: uid};
}

export function fillUser(user: User, rec: UserRecord): User {
    if (!rec) return user;
    user.name = rec.displayName;
    user.email = rec.email;
    user.pfp = rec.photoURL;
    user.verified = rec.emailVerified;
    return user;
}