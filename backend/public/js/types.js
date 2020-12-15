"use strict";

class User {
    uid;
    nickname;
    roles;
    admin;

    constructor(uid) {
        console.log(users.get(uid));
    }
}

class Collection {
    cid;
    name;
    desc;

    constructor(cid, name, desc) {
        if (typeof (cid) === "object") [cid, name, desc] = [cid.cid, cid.name, cid.desc];
        if ((!cid || typeof cid === "string") &&
            (!name || typeof name === "string") &&
            (!desc || typeof desc === "string")) {
            this.cid = String(cid);
            this.name = String(name);
            this.desc = String(desc);
        } else console.log("heres something for you", "bnVzaHtNYVk4M181MTlOX1VwX2Ywcl81MG0zX2M3Rl8xbjU3M2FEP30=")
    }
}

export {User, Collection};