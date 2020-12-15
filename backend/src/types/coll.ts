class Collection {
    cid: string;
    name: string;
    desc: string;

    constructor(cid: string | any, name?: string, desc?: string) {
        if (typeof cid === 'string') {
            this.cid = cid;
            this.name = name || cid;
            this.desc = desc || "No description yet.";
        } else {
            this.cid = cid.cid;
            this.name = cid.name;
            this.desc = cid.desc;
        }
    }

    toData() {
        return {
            cid: this.cid,
            name: this.name,
            desc: this.desc
        }
    }
}

export default Collection