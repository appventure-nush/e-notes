import {updateNote} from "../utils";
import {COLLECTION_IMAGE_STORE, COLLECTION_NOTES_STORE} from "../storage";
import {COLLECTION_NOTE_PATH} from "../routes/api/collections";
import streamToPromise from "stream-to-promise";

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
    const stream = COLLECTION_IMAGE_STORE.read(COLLECTION_NOTE_PATH(cid, nid))
        ?.pipe(COLLECTION_IMAGE_STORE.write(COLLECTION_NOTE_PATH(cid, newNid)));
    return Promise.all([
        stream ? streamToPromise(stream)
            .then(() => COLLECTION_NOTES_STORE.delete(COLLECTION_NOTE_PATH(cid, nid))) : null,
        deleteNote(cid, nid)
    ]);
}

export function deleteNote(cid: string, nid: string) {
    COLLECTION_NOTES_STORE.delete(COLLECTION_NOTE_PATH(cid, nid))
    return Promise.all([
        updateNote(cid, nid, undefined)
    ]);
}