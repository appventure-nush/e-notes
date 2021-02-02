import {autoConvertMapToObject} from '../utils';

class Role {
    rid: string;
    name: string;
    desc: string;
    defaultPerm: boolean;
    permissions: Map<string, boolean>;

    constructor(rid: string | any, name?: string, desc?: string, defaultPerm?: boolean | string) {
        if (typeof rid === 'string') {
            this.rid = rid;
            this.name = name || rid;
            this.desc = desc || "No description yet.";
            this.permissions = new Map<string, boolean>();
            if (defaultPerm === "on" || defaultPerm === "true") defaultPerm = true;
            if (defaultPerm === "off" || defaultPerm === "false") defaultPerm = false;
            this.defaultPerm = !(!defaultPerm);
        } else {
            const src = rid as any;
            this.rid = src.rid;
            this.name = src.name;
            this.desc = src.desc;
            this.permissions = new Map<string, boolean>(Object.entries(src.permissions));
            this.defaultPerm = src.defaultPerm;
        }
    }


    setPermissions(permissions: any) {
        for (const permission of Object.keys(permissions)) this.setPermission(permission, permissions[permission]);
    }

    setPermission(cid: string, accepts: boolean | string) {
        if (typeof accepts === 'undefined') this.permissions.delete(cid);
        if (typeof accepts === 'string') if (accepts === "undefined" || accepts === "delete") {
            this.permissions.delete(cid);
            return;
        } else accepts = accepts === "true";
        this.permissions.set(cid, accepts);
    }

    accepts(cid: string) {
        return this.defaultPerm || (this.permissions.has(cid) && this.permissions.get(cid));
    }

    rejects(cid: string) {
        return this.permissions.has(cid) && this.permissions.get(cid) === false;
    }

    toData() {
        return {
            rid: this.rid,
            name: this.name,
            desc: this.desc,
            defaultPerm: this.defaultPerm,
            permissions: autoConvertMapToObject(this.permissions)
        }
    }
}

export default Role;