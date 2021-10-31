export interface Note {
    index: number;
    cid: string;
    nid: string;
    name: string;
    desc: string;
    lastEditBy: string;
    lastEdit: number;
    url: string;

    jupyter?: boolean;
}

export function makeNote(i: number, nid: string, cid: string, owner: string, name?: string, desc?: string): Note {
    return {
        index: i,
        url: null,
        cid: cid,
        nid: nid,
        name: name || nid,
        desc: desc,
        lastEditBy: owner,
        lastEdit: Date.now()
    };
}