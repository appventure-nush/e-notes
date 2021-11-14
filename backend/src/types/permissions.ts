export interface MutablePermissions {
    permissions: { [key: string]: boolean };
}

export function _setPermissions(obj: MutablePermissions, permissions: any) {
    for (const permission in permissions) _setPermission(obj, permission, permissions[permission]);
    for (const permission in obj.permissions) if (!(permission in permissions)) _setPermission(obj, permission, undefined);
}

export function _setPermission(obj: MutablePermissions, cid: string, accepts: boolean | string | undefined) {
    if (!obj.permissions) obj.permissions = {};
    if (typeof accepts === 'undefined') delete obj.permissions[cid];
    if (typeof accepts === 'boolean') obj.permissions[cid] = accepts;
    if (typeof accepts === 'string') {
        if (accepts === "undefined" || accepts === "delete") delete obj.permissions[cid];
        else obj.permissions[cid] = accepts === "true";
    }
}

export function _accepts(obj?: MutablePermissions, cid?: string) {
    return obj && cid && obj.permissions && obj.permissions.hasOwnProperty(cid) && obj.permissions[cid];
}

export function _rejects(obj?: MutablePermissions, cid?: string) {
    return obj && cid && obj.permissions && obj.permissions.hasOwnProperty(cid) && !obj.permissions[cid];
}