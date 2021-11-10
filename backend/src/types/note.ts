import {firestore, storage} from "firebase-admin";
import {updateNote} from "../utils";

export interface Note {
    index: number;
    cid: string;
    nid: string;
    name: string;
    desc: string;
    lastEditBy: string;
    lastEdit: number;
    url: string;

    type?: NoteType;
}

export type NoteType = "jupyter" | "markdown" | "html";

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

export function renameNote(cid: string, nid: string, newNid: string) {
    return Promise.all([
        storage().bucket().file(`collections/${cid}/notes/${nid}`).move(storage().bucket().file(`collections/${cid}/notes/${newNid}`)),
        deleteNote(cid, nid)
    ]);
}

export function deleteNote(cid: string, nid: string) {
    return Promise.all([
        updateNote(cid, nid, undefined),
        storage().bucket().file(`collections/${cid}/notes/${nid}`).delete(),
    ]);
}