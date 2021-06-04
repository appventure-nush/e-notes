export class MutablePermissions {
    permissions: { [key: string]: boolean };

    setPermissions(permissions: any) {
        for (const permission of Object.keys(permissions)) this.setPermission(permission, permissions[permission]);
    }

    setPermission(cid: string, accepts: boolean | string) {
        if (typeof accepts === 'undefined') delete this.permissions[cid];
        if (typeof accepts === 'string') {
            if (accepts === "undefined" || accepts === "delete") {
                delete this.permissions[cid];
                return;
            } else accepts = accepts === "true";
        }
        this.permissions[cid] = accepts;
    }

    accepts(cid: string) {
        return this.permissions.hasOwnProperty(cid) && this.permissions[cid];
    }

    rejects(cid: string) {
        return this.permissions.hasOwnProperty(cid) && this.permissions[cid] === false;
    }
}