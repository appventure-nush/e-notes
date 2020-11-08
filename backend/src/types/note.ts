class Note {
    cid: string;
    noteId: string;
    name: string;
    desc: string;
    releaseTime: number;
    url: string;

    constructor(noteId: string | any, cid?: string, name?: string, desc?: string) {
        if (typeof noteId === 'string') {
            this.cid = cid;
            this.noteId = noteId;
            this.name = name || noteId;
            this.desc = desc || "No description yet.";
            this.releaseTime = Date.now();
        } else {
            const src = noteId as any;
            this.cid = src.cid;
            this.noteId = src.noteId;
            this.name = src.name;
            this.desc = src.desc;
            this.releaseTime = src.releaseTime;
            this.url = src.url;
        }
    }

    toData() {
        return {
            cid: this.cid,
            nodeId: this.noteId,
            name: this.name,
            desc: this.desc,
            releaseTime: this.releaseTime,
            url: this.url
        };
    }
}

export default Note;