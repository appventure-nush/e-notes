import {
    ADMIN_PERMISSION, TEACHER_PERMISSION, VIEW_OTHER_COLLECTION,
    CREATE_COLLECTION, EDIT_OTHER_COLLECTION, User
} from "@/types/user";
import Config from "@/store/config";
import {Collection} from "@/types/coll";

export function isAdmin(): boolean {
    if (!Config.profile) return false;
    return Config.profile.admin;
}

export function canCreate(): boolean {
    return hasPermission(computeAccess(Config.profile), CREATE_COLLECTION);
}

export function canEdit(collection: Collection): boolean {
    return hasPermission(computeAccess(Config.profile, collection), EDIT_OTHER_COLLECTION);
}

export function computeAccess(user: User | null, collection?: Collection): number {
    if (!user) return 0;
    let final = user.access || 0;
    if (user.teacher) final |= TEACHER_PERMISSION;
    if (user.admin) final |= ADMIN_PERMISSION;

    if (collection && user.permissions[collection.cid]) {
        const perm = user.permissions[collection.cid];
        if (typeof perm === "boolean") final |= VIEW_OTHER_COLLECTION;
        else final |= perm;
    }

    // if in the context of a collection
    if (collection && collection.owner === user.uid) final |= ADMIN_PERMISSION;
    if (collection && user.has_control_over && user.has_control_over.includes(collection.cid)) final |= ADMIN_PERMISSION;

    return final;
}

export function hasPermission(access: number, perm: number) {
    return (access & perm) === perm;
}

export function splitAccess(access: number): number[] {
    const final = [];
    for (let p = 1; access >= p; p *= 2) if ((access & p) === p) final.push(p);
    return final;
}