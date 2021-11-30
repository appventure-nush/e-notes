import admin from "firebase-admin";
import {Collection} from "./coll";
import {MutablePermissions} from "./permissions";
import UserRecord = admin.auth.UserRecord;

export const VIEW_OTHER_COLLECTION = 0b001;
export const EDIT_OTHER_COLLECTION = 0b010;
export const CREATE_COLLECTION = 0b100;

export const TEACHER_PERMISSION = CREATE_COLLECTION;

export const ADMIN_PERMISSION = CREATE_COLLECTION | VIEW_OTHER_COLLECTION | EDIT_OTHER_COLLECTION;

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

export function computeAccess(user?: User, collection?: Collection): number {
    if (!user) return 0;
    let final = user.access || 0;
    if (user.teacher) final |= TEACHER_PERMISSION;
    if (user.admin) final |= ADMIN_PERMISSION;

    if (collection && user.permissions[collection.cid]) {
        let perm = user.permissions[collection.cid];
        if (typeof perm === "boolean") final |= VIEW_OTHER_COLLECTION;
        else final |= perm;
    }

    // if in the context of a collection
    if (collection && collection.owner === user.uid) final |= ADMIN_PERMISSION;
    if (collection && user.has_control_over && user.has_control_over.includes(collection.cid)) final |= ADMIN_PERMISSION;

    return final;
}

export function hasPermission(access: number, perm: number) {
    return ((access || 0) & perm) === perm;
}

export function splitAccess(access: number): number[] {
    const final = [];
    for (let p = 1; access >= p; p *= 2) if (((access || 0) & p) === p) final.push(p);
    return final;
}