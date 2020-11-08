class Collection {
    cid: string;
    name: string;
    desc: string;

    constructor(cid: string, name: string, desc: string) {
        this.cid = cid;
        this.name = name || cid;
        this.desc = desc || "No description yet.";
    }

    toData() {
        return {
            cid: this.cid,
            name: this.name,
            desc: this.desc
        }
    }
}

export default Collection;