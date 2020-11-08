import {updateRole} from '../utils';

class Role {
    roleId: string;
    name: string;
    desc: string;
    defaultPerm: boolean;
    permissions: Map<string, boolean>;

    constructor(roleId: string | any, name?: string, desc?: string, defaultPerm?: boolean) {
        if (typeof roleId === 'string') {
            this.roleId = roleId;
            this.name = name || roleId;
            this.desc = desc || "No description yet.";
            this.permissions = new Map<string, boolean>();
            this.defaultPerm = defaultPerm === true;
        } else {
            const src = roleId as any;
            this.roleId = src.roleId;
            this.name = src.name;
            this.desc = src.desc;
            this.permissions = new Map<string, boolean>(Object.entries(src.permissions));
            this.defaultPerm = src.defaultPerm;
        }
    }

    async setPermission(cid: string, accepts: boolean) {
        if (typeof accepts === 'undefined') this.permissions.delete(cid);
        this.permissions.set(cid, accepts);
        await updateRole(this.roleId, this);
    }

    accepts(cid: string) {
        return this.defaultPerm || (this.permissions.has(cid) && this.permissions.get(cid));
    }

    rejects(cid: string) {
        return this.permissions.has(cid) && this.permissions.get(cid) === false;
    }

    toData() {
        return {
            roleId: this.roleId,
            name: this.name,
            desc: this.desc,
            defaultPerm: this.defaultPerm,
            permissions: autoConvertMapToObject(this.permissions)
        }
    }
}

const autoConvertMapToObject = (map: Map<string, any>) => {
    const obj = {};
    for (const [key, value] of map)
        // @ts-ignore
        obj[key] = value;
    return obj;
}
export default Role;