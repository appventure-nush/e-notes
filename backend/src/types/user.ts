import {updateUser} from '../utils';

class User {
    uid: string;

    nickname?: string;
    roles: string[];
    admin = false;
    permissions: Map<string, boolean>;

    constructor(user: string | any) {
        if (typeof user === 'string') {
            this.uid = user;
            this.roles = [];
            this.permissions = new Map<string, boolean>();
        } else {
            this.uid = user.uid;
            this.nickname = user.nickname;
            this.roles = user.roles;
            this.admin = user.admin;
            this.permissions = new Map(Object.entries(user.permissions));
        }
    }

    async setNickname(nickname: string) {
        this.nickname = nickname;
        await updateUser(this.uid, this);
    }

    async setPermission(cid: string, accepts: boolean) {
        if (typeof accepts === 'undefined') this.permissions.delete(cid);
        this.permissions.set(cid, accepts);
        await updateUser(this.uid, this);
    }

    accepts(cid: string) {
        return this.permissions.has(cid) && this.permissions.get(cid);
    }

    rejects(cid: string) {
        return this.permissions.has(cid) && this.permissions.get(cid) === false;
    }

    toData() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            roles: this.roles,
            admin: this.admin,
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
export default User;