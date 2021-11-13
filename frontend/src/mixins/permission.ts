import {
    ADMIN_PERMISSION, TEACHER_PERMISSION,
    CREATE_COLLECTION, EDIT_OTHER_COLLECTION, User
} from "@/types/user";
import store from "@/store";
import {Collection} from "@/types/coll";

export function isAdmin(): boolean {
    const user = store.state.profile;
    if (!user) return false;
    return user.admin;
}

export function canCreate(): boolean {
    return hasPermission(computeAccess(store.state.profile), CREATE_COLLECTION);
}

export function canEdit(collection: Collection): boolean {
    return hasPermission(computeAccess(store.state.profile, collection), EDIT_OTHER_COLLECTION);
}

export function computeAccess(user?: User, collection?: Collection): number {
    if (!user) return 0;
    let final = user.access || 0;
    if (user.teacher) final |= TEACHER_PERMISSION;
    if (user.admin) final |= ADMIN_PERMISSION;

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