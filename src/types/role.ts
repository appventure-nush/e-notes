import {MutablePermissions} from "./permissions";

class Role extends MutablePermissions {
    rid: string;
    name: string;
    desc: string;
    defaultPerm: boolean;

    constructor(rid: string | any, name?: string, desc?: string, defaultPerm?: boolean | string) {
        super();
        if (typeof rid === 'string') {
            this.rid = rid;
            this.name = name || rid;
            this.desc = desc || "No description yet.";
            this.permissions = {};
            if (defaultPerm === "on" || defaultPerm === "true") defaultPerm = true;
            if (defaultPerm === "off" || defaultPerm === "false") defaultPerm = false;
            this.defaultPerm = !(!defaultPerm);
        } else {
            const src = rid as any;
            this.rid = src.rid;
            this.name = src.name;
            this.desc = src.desc;
            this.permissions = src.permissions;
            this.defaultPerm = src.defaultPerm;
        }
    }

    accepts(cid: string) {
        return this.defaultPerm || super.accepts(cid);
    }
}

export default Role;