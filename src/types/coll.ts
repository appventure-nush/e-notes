export interface Collection {
    cid: string;
    name: string;
    desc: string;
    open: boolean;
}

export function makeColl(cid: string | any, name?: string, desc?: string, open = false): Collection {
    return {cid: cid, desc: desc || "No description yet.", name: name || cid, open: !(!open)};
}