import {firestore} from "firebase-admin/lib/firestore";
import DocumentData = firestore.DocumentData;

export class Collection {
    cid: string;
    name: string;
    desc: string;
    open: boolean;
}

export function makeColl(cid: string | any, name?: string, desc?: string, open = false): Collection {
    let coll = new Collection();
    coll.cid = cid;
    coll.name = name || cid;
    coll.desc = desc || "No description yet.";
    coll.open = !(!open);
    return coll;
}

export function toColl(obj: DocumentData): Collection {
    return obj as Collection;
}
