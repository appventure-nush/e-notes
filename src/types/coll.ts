export interface Collection {
    cid: string;
    name: string;
    desc: string;
    open: boolean;
    owner: string;
}

export function makeColl(cid: string | any, owner: string, name?: string, desc?: string, open = false): Collection {
    return {cid: cid, desc: desc || "No description yet.", owner: owner, name: name || cid, open: !(!open)};
}