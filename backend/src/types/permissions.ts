export interface MutablePermissions {
    permissions: { [key: string]: boolean };
}

export function _setPermissions(obj: MutablePermissions, permissions: any) {
    for (const permission of Object.keys(permissions)) _setPermission(obj, permission, permissions[permission]);
}

export function _setPermission(obj: MutablePermissions, cid: string, accepts: boolean | string) {
    if (typeof accepts === 'undefined') delete obj.permissions[cid];
    if (typeof accepts === 'string') {
        if (accepts === "undefined" || accepts === "delete") {
            delete obj.permissions[cid];
            return;
        } else accepts = accepts === "true";
    }
    obj.permissions[cid] = accepts;
}

export function _accepts(obj: MutablePermissions, cid: string) {
    return obj && obj.permissions && obj.permissions.hasOwnProperty(cid) && obj.permissions[cid] === true;
}

export function _rejects(obj: MutablePermissions, cid: string) {
    return obj && obj.permissions && obj.permissions.hasOwnProperty(cid) && obj.permissions[cid] === false;
}