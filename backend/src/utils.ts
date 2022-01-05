import {
    computeAccess,
    CREATE_COLLECTION,
    EDIT_OTHER_COLLECTION,
    fillUser,
    hasPermission,
    makeUser,
    User,
    VIEW_OTHER_COLLECTION
} from './types/user';
import {Role, roleAccepts} from './types/role';
import {Note} from "./types/note";
import {Collection} from "./types/coll";
import express from "express";
import admin from "firebase-admin";
import {_rejects} from "./types/permissions";
import {Action, addAudit, Category, simpleAudit} from "./types/audit";
import {error, failed} from "./response";

import LRU from "lru-cache";
import {auth, db} from "./app";
import {startListening} from "./config";
import {UploadedFile} from "express-fileupload";
import imageType from "image-type";
import DocumentSnapshot = admin.firestore.DocumentSnapshot;
import DocumentData = admin.firestore.DocumentData;
import QuerySnapshot = admin.firestore.QuerySnapshot;
import UserRecord = admin.auth.UserRecord;

export const noteCache = new LRU<string, Note[]>({max: 1000, maxAge: 1000});
export const idTokenCache = new LRU<string, admin.auth.DecodedIdToken>({max: 1000, maxAge: 60 * 1000});
export const userCache = new LRU<string, admin.auth.UserRecord>({max: 1000, maxAge: 60 * 1000});

export const profileCache = new LRU<string, User>({max: Infinity});
export const roleCache = new LRU<string, Role>({max: Infinity});
export const collectionCache = new LRU<string, Collection>({max: Infinity});

function endsWithAny(suffixes: string[], str?: string) {
    return suffixes.some(suffix => str && str.endsWith(suffix));
}

export async function getFBUser(uid: string): Promise<UserRecord | undefined> {
    let fbUser = userCache.get(uid);
    if (fbUser) return fbUser;
    try {
        userCache.set(uid, fbUser = await auth.getUser(uid));
        return fbUser;
    } catch (e) {
        return undefined;
    }
}

export async function getUser(uid: string): Promise<User | undefined> { // heavy call function
    if (!uid) return undefined;
    const fbUser = await getFBUser(uid);
    if (!fbUser) return undefined;
    let user = profileCache.get(uid);
    if (!user) {
        const ref = db.collection("users").doc(fbUser.uid);
        const get = await ref.get();
        if (get.exists) updateUserCache(fbUser.uid, user = get.data() as User);
        else {
            if (endsWithAny(['@nushigh.edu.sg', '@nus.edu.sg', '@enotes.nush.app', '@nush.app'], fbUser.email)) {
                user = makeUser(fbUser.uid);
                fillUser(user, fbUser);
                await Promise.all([ref.set(user), addAudit(simpleAudit("root", user.uid, Category.USER, Action.CREATE))]);
            } else {
                throw new Error("only nus/nushigh emails allowed");
            }
        }
    }
    return fillUser(user, fbUser);
}

export async function updateUser(uid: string, value: User): Promise<User> {
    value.roles = [...new Set(value.roles)];
    updateUserCache(uid, value);
    if (value) await db.collection("users").doc(uid).update(value);
    else await db.collection("users").doc(uid).delete();
    return value;
}

export async function updateRole(rid: string, value?: Role): Promise<Role | undefined> {
    if (value) {
        if (roleCache.has(rid)) await db.collection("roles").doc(rid).update(value);
        else await db.collection("roles").doc(rid).set(value);
    } else await db.collection("roles").doc(rid).delete();
    updateRoleCache(rid, value);
    return value;
}

export function updateUserCache(uid: string, value: User) {
    if (value) profileCache.set(uid, value);
    else profileCache.del(uid);
}

export function updateRoleCache(rid: string, value?: Role) {
    if (value) roleCache.set(rid, value);
    else roleCache.del(rid);
}

export async function getNote(cid: string, nid: string): Promise<Note | undefined> {
    let notes = await getNotes(cid);
    if (notes) return notes.find(note => note.nid === nid);
}

export async function getNotes(cid: string): Promise<Note[] | undefined> {
    if (noteCache.has(cid)) return noteCache.get(cid);
    else {
        if (!collectionCache.get(cid)) return [];
        const allNotes = await db.collection("collections").doc(cid).collection("notes").get();
        const notes = allNotes.docs.map((doc: DocumentSnapshot) => doc.data() as Note);
        noteCache.set(cid, notes.sort((a, b) => a.index - b.index));
        return notes;
    }
}

export async function updateNote(cid: string, nid: string, note?: Note) {
    const notes = await getNotes(cid);
    if (!notes) throw new Error('notes_not_found');
    if (note) {
        const index = notes.findIndex(n => n.nid === nid);
        if (index === -1) {
            if (note.index === -1) note.index = notes.length;
            notes.push(note);
            return await db.collection("collections").doc(cid).collection("notes").doc(nid).set(note);
        } else {
            notes[index] = note;
            return await db.collection("collections").doc(cid).collection("notes").doc(nid).set(note);
        }
    } else {
        notes.splice(notes.findIndex(n => n.nid === nid), 1);
        return await db.collection("collections").doc(cid).collection("notes").doc(nid).delete();
    }
}

// permission system in order of priority
// 1) user defined (per-user-permissions, user.additional)
// 2) collection defined as open
// 3) role rejection (specified not allow)
// 4) role acceptance (specified allow)
// 5) role default (default allow) there is no default reject
export async function hasPermissions(uid: string, cid: string): Promise<boolean> { // used in middleware
    const user = await getUser(uid);
    if (!user) return false;
    const collection = collectionCache.get(cid);

    if (user.admin) return true; // well, here we go, an admin
    if (user.teacher && cid === "help-pro") return true;// hehe cheaty
    if (collection?.hasReadAccess?.includes(uid)) return true;

    const userRoles = user.roles.map(rid => roleCache.get(rid)).filter(role => role);
    if (userRoles.some(role => _rejects(role, cid))) return false;
    if (_rejects(user, cid)) return false;
    return collection?.open ||
        hasPermission(computeAccess(user, collection), VIEW_OTHER_COLLECTION) ||
        userRoles.some(role => roleAccepts(role, cid));
}

export async function checkEditPermissions(req: express.Request, cid?: string): Promise<boolean> {
    return hasPermission(computeAccess(req.user, collectionCache.get(cid || req.params.cid)), EDIT_OTHER_COLLECTION);
}

export async function checkCreatePermissions(req: express.Request): Promise<boolean> {
    return hasPermission(computeAccess(req.user), CREATE_COLLECTION);
}

export async function getAvailableCollections(uid: string) { // used in middleware
    const colls = collectionCache.values();
    const flags = await Promise.all(colls.map(c => hasPermissions(uid, c.cid)));
    return colls.filter((c, i) => flags[i]).sort(sortHandler('cid'));
}

async function getUID(req: express.Request): Promise<string | undefined> {
    const idToken = req.header("Authorization");
    const sessionCookie = req.cookies.session;
    let result;
    if (idToken) {
        if (!(result = idTokenCache.get(idToken))) {
            result = await auth.verifyIdToken(idToken);
            idTokenCache.set(idToken, result);
        }
        return result.uid;
    } else if (sessionCookie) {
        if (!(result = idTokenCache.get(sessionCookie))) {
            result = await auth.verifySessionCookie(sessionCookie, true);
            idTokenCache.set(sessionCookie, result);
        }
        return result.uid;
    }
}

export async function checkUser(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            req.uid = uid;
            req.user = await getUser(uid);
            return next();
        } else return res.json(error('not_logged_in'));
    } catch (e) {
        if (e.message === "only nus/nushigh emails allowed")
            return res.json(error('non_school_email_not_allowed'));
        // await error({func: 'checkUserOptional', body: req.body, path: req.path});
        return res.json(error({reason: 'login_expired', message: e.message}));
    }
}

export async function checkUserOptional(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            req.uid = uid;
            req.user = await getUser(uid);
        }
    } catch (e) {
        return res.json(error({reason: 'login_expired', message: e.message}));
    }
    return next();
}

export async function checkPermissions(req: express.Request, res: express.Response, next: () => any) {
    if (await hasPermissions(req.uid!, req.params.cid)) return next();
    else return res.json(failed("not authorized"));
}

const IMAGE_FORMATS = ['image/gif', 'image/jpeg', 'image/png'];

export function filterBadImageUpload(req: express.Request, res: express.Response, next: () => any) {
    if (!req.files) return res.json(failed('where is the file'));
    const uploaded: UploadedFile | UploadedFile[] = req.files.file;
    if (!uploaded) return res.json(failed('where is the file'));
    if (Array.isArray(uploaded)) return res.json(failed("single images only"));
    if (!("data" in uploaded)) return res.json(failed('empty file'));
    if (uploaded.truncated) return res.json(failed("file was truncated"));

    const type = imageType(uploaded.data);
    if (!type || type.mime.toUpperCase() !== uploaded.mimetype.toUpperCase()) return res.json(failed('i like your funny words, magic man'));
    if (!IMAGE_FORMATS.includes(type.mime.toLowerCase())) return res.json(failed('only gif/jpg/png allowed!'));
    req.approvedImage = uploaded;
    next();
}

export async function checkAdmin(req: express.Request, res: express.Response, next: () => any) {
    if (req.user?.admin) return next();
    else return res.json(failed("not admin"));
}

export function setup(): (() => void)[] {
    // probably not very efficient
    return [
        ...startListening(),
        db.collection('collections').onSnapshot(genQuerySnapshotHandler(c => c.cid, collectionCache)),
        db.collection('roles').onSnapshot(genQuerySnapshotHandler(r => r.rid, roleCache)),
        db.collection('users').onSnapshot(genQuerySnapshotHandler(u => u.uid, profileCache))];
}

export function genQuerySnapshotHandler<T>(getID: (el: T) => string, cache: LRU<string, T>): (querySnapshot: QuerySnapshot<DocumentData>) => void {
    return (querySnapshot: QuerySnapshot<DocumentData>) => {
        querySnapshot.docChanges().forEach(change => {
            const t = change.doc.data() as T;
            const id = getID(t);

            if (change.type === "added" || change.type === "modified") cache.set(id, t);
            else if (change.type === "removed") cache.del(id);
        });
    }
}

function onlyUnique<T>(value: T, index: number, self: T[]) {
    return self.indexOf(value) === index;
}

export function difference(a: any, b: any) {
    let l: any = {};
    for (let key of [...Object.keys(a), ...Object.keys(b)].filter(onlyUnique)) if (a[key] !== b[key]) l[key] = a[key];
    return l;
}

export function sortHandler<T>(key: keyof T): (a: T, b: T) => number {
    return (a: T, b: T) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0)
}


/**
 * Returns the last element in the array where predicate is true, and undefined
 * otherwise.
 * @param array The source array to search in
 * @param predicate find calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
 */
export function findLast<T>(array: T[], predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array))
            return array[l];
    }
}