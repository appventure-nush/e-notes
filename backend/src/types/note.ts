class Note {
    cid: string;
    nid: string;
    name: string;
    desc: string;
    lastEdit: number;
    url: string;

    constructor(nid: string | any, cid?: string, name?: string, desc?: string) {
        if (typeof nid === 'string') {
            this.cid = cid;
            this.nid = nid;
            this.name = name || nid;
            this.desc = desc || "No description yet.";
            this.lastEdit = Date.now();
        } else {
            const src = nid as any;
            this.cid = src.cid;
            this.nid = src.nid;
            this.name = src.name;
            this.desc = src.desc;
            this.lastEdit = src.lastEdit;
            this.url = src.url;
        }
    }

    toData() {
        return {
            cid: this.cid,
            nid: this.nid,
            name: this.name,
            desc: this.desc,
            lastEdit: this.lastEdit,
            url: this.url
        };
    }
}

export default Note;