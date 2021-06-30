import {_accepts, MutablePermissions} from "./permissions";

export interface Role extends MutablePermissions {
    rid: string;
    name: string;
    desc: string;
    defaultPerm: boolean;
}

export function makeRole(rid: string, name?: string, desc?: string, defaultPerm?: boolean | string): Role {
    let role: Role = {
        defaultPerm: false,
        desc: desc || "No description yet.",
        name: name || rid,
        permissions: {},
        rid: rid
    };
    if (defaultPerm === "on" || defaultPerm === "true") defaultPerm = true;
    if (defaultPerm === "off" || defaultPerm === "false") defaultPerm = false;
    role.defaultPerm = !(!defaultPerm);
    return role;
}

export function roleAccepts(role: Role, cid: string) {
    return this.defaultPerm || _accepts(role, cid);
}