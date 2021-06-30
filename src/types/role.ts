import {_accepts, MutablePermissions} from "./permissions";
import {firestore} from "firebase-admin/lib/firestore";
import DocumentData = firestore.DocumentData;

export class Role extends MutablePermissions {
    rid: string;
    name: string;
    desc: string;
    defaultPerm: boolean;
}

export function makeRole(rid: string, name?: string, desc?: string, defaultPerm?: boolean | string): Role {
    let role = new Role();
    role.rid = rid;
    role.name = name || rid;
    role.desc = desc || "No description yet.";
    role.permissions = {};
    if (defaultPerm === "on" || defaultPerm === "true") defaultPerm = true;
    if (defaultPerm === "off" || defaultPerm === "false") defaultPerm = false;
    role.defaultPerm = !(!defaultPerm);
    return role;
}

export function toRole(obj: DocumentData): Role {
    return obj as Role;
}

export function roleAccepts(role: Role, cid: string) {
    return this.defaultPerm || _accepts(role, cid);
}