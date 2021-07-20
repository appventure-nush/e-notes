export interface Note {
    index: number;
    cid: string;
    nid: string;
    name: string;
    desc: string;
    lastEdit: number;
    url: string;
}

export function makeNote(i: number, nid: string, cid?: string, name?: string, desc?: string): Note {
    return {
        index: i,
        url: null,
        cid: cid,
        nid: nid,
        name: name || nid,
        desc: desc,
        lastEdit: Date.now()
    };
}