import {updateNote} from "../utils";
import {COLLECTION_NOTES_STORE} from "../storage";
import {COLLECTION_NOTE_PATH} from "../routes/api/collections";

export interface Note {
    index: number;
    cid: string;
    nid: string;
    name: string;
    desc?: string;
    lastEditBy: string;
    lastEdit: number;
    url?: string;

    type?: NoteType;
}

export type NoteType = "jupyter" | "markdown" | "html";

export function makeNote(i: number, nid: string, cid: string, owner: string, name?: string, desc?: string): Note {
    return {
        index: i,
        cid: cid,
        nid: nid,
        name: name || nid,
        desc: desc,
        lastEditBy: owner,
        lastEdit: Date.now()
    };
}

export function renameNote(cid: string, nid: string, newNid: string) {
    COLLECTION_NOTES_STORE.rename(COLLECTION_NOTE_PATH(cid, nid), COLLECTION_NOTE_PATH(cid, newNid));
    return Promise.all([
        updateNote(cid, nid, undefined)
    ]);
}

export function deleteNote(cid: string, nid: string) {
    COLLECTION_NOTES_STORE.delete(COLLECTION_NOTE_PATH(cid, nid))
    return Promise.all([
        updateNote(cid, nid, undefined)
    ]);
}