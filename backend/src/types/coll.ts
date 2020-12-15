class Collection {
    cid: string;
    name: string;
    desc: string;
    open: boolean;

    constructor(cid: string | any, name?: string, desc?: string, open = false) {
        if (typeof cid === 'string') {
            this.cid = cid;
            this.name = name || cid;
            this.desc = desc || "No description yet.";
            this.open = !(!open);
        } else {
            this.cid = cid.cid;
            this.name = cid.name;
            this.desc = cid.desc;
            this.open = !(!cid.open);
        }
    }

    toData() {
        return {
            cid: this.cid,
            name: this.name,
            desc: this.desc,
            open: this.open
        }
    }
}

export default Collection;