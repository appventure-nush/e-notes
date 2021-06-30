export interface Note {
    cid: string;
    nid: string;
    name: string;
    desc: string;
    lastEdit: number;
    url: string;
}

export function makeNote(nid: string, cid?: string, name?: string, desc?: string): Note {
    return {
        url: null,
        cid: cid,
        nid: nid,
        name: name || nid,
        desc: desc || "No description yet.",
        lastEdit: Date.now()
    };
}