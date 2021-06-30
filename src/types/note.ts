import {firestore} from "firebase-admin/lib/firestore";
import DocumentData = firestore.DocumentData;

export class Note {
    cid: string;
    nid: string;
    name: string;
    desc: string;
    lastEdit: number;
    url: string;
}

export function makeNote(nid: string, cid?: string, name?: string, desc?: string): Note {
    let note = new Note();
    note.cid = cid;
    note.nid = nid;
    note.name = name || nid;
    note.desc = desc || "No description yet.";
    note.lastEdit = Date.now();
    return note;
}

export function toNote(obj: DocumentData): Note {
    return obj as Note;
}