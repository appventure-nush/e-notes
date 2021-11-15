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
import admin, {auth, firestore} from "firebase-admin";
import {_accepts, _rejects} from "./types/permissions";
import DocumentSnapshot = admin.firestore.DocumentSnapshot;
import DocumentData = firestore.DocumentData;
import QuerySnapshot = firestore.QuerySnapshot;
import {Action, addAudit, Category, simpleAudit} from "./types/audit";
import {error, failed} from "./response";

import LRU from "lru-cache";

const users: User[] = [];
const roles: Role[] = [];
const collections: Collection[] = [];

export const getUsers = (): User[] => users;

export const noteCache = new LRU<string, Note[]>(1000);
export const idTokenCache = new LRU<string, auth.DecodedIdToken>({max: 1000, maxAge: 60 * 1000});
export const userCache = new LRU<string, auth.UserRecord>({max: 1000, maxAge: 60 * 1000});

export async function getUser(uid: string): Promise<User | undefined> { // heavy call function
    if (!uid) return undefined;
    let fbUser = userCache.get(uid);
    if (!fbUser) userCache.set(uid, fbUser = await auth().getUser(uid));
    if (!fbUser) return undefined;
    let user = users.find(user => user.uid === uid);
    if (!user) {
        let ref = firestore().collection("users").doc(fbUser.uid);
        let get = await ref.get();
        if (get.exists) updateUserCache(fbUser.uid, user = get.data() as User); else {
            user = makeUser(fbUser.uid);
            await Promise.all([ref.set(user), addAudit(simpleAudit("root", user.uid, Category.USER, Action.CREATE))]);
        }
    }
    return fillUser(user, fbUser);
}

export function findUserWithRole(rid: string): User[] {
    return users.filter(u => u.roles.includes(rid));
}

export function getRole(rid: string): Role | undefined { // heavy call function
    return rid ? roles.find(role => role.rid === rid) : undefined;
}

export async function updateUser(uid: string, value: User): Promise<User> {
    value.roles = [...new Set(value.roles)];
    updateUserCache(uid, value);
    if (value) await firestore().collection("users").doc(uid).update(value);
    else await firestore().collection("users").doc(uid).delete();
    return value;
}

export async function updateRole(rid: string, value?: Role): Promise<Role | undefined> {
    updateRoleCache(rid, value);
    if (value) await firestore().collection("roles").doc(rid).update(value);
    else await firestore().collection("roles").doc(rid).delete();
    return value;
}

export function updateUserCache(uid: string, value: User) {
    if (value) {
        const index = users.findIndex(user => user.uid === uid);
        if (index === -1) users.push(value);
        else users[index] = value;
    } else users.splice(users.findIndex(user => user.uid === uid), 1);
}

export function updateRoleCache(rid: string, value?: Role) {
    if (value) {
        const index = roles.findIndex(role => role.rid === rid);
        if (index === -1) roles.push(value);
        else roles[index] = value;
    } else roles.splice(roles.findIndex(role => role.rid === rid), 1);
}

export function getAllRoles(): Role[] {
    return roles;
}

export async function getNote(cid: string, nid: string): Promise<Note | undefined> {
    let notes = await getNotes(cid);
    if (notes) return notes.find(note => note.nid === nid);
}

export async function getNotes(cid: string): Promise<Note[] | undefined> {
    if (noteCache.has(cid)) return noteCache.get(cid);
    else {
        if (!getCollection(cid)) return [];
        const allNotes = await firestore().collection("collections").doc(cid).collection("notes").get();
        const notes = allNotes.docs.map((doc: DocumentSnapshot) => doc.data() as Note);
        noteCache.set(cid, notes);
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
        } else notes[index] = note;
        return await firestore().collection("collections").doc(cid).collection("notes").doc(nid).update(note);
    } else {
        notes.splice(notes.findIndex(n => n.nid === nid), 1);
        return await firestore().collection("collections").doc(cid).collection("notes").doc(nid).delete();
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
    const collection = getCollection(cid);
    if (user.admin) return true; // well, here we go, an admin
    if (_accepts(user, cid)) return true;
    if (_rejects(user, cid)) return false;
    if (hasPermission(computeAccess(user, collection), VIEW_OTHER_COLLECTION)) return true;
    if (collection?.hasReadAccess.includes(uid)) return true;
    const userRoles = user.roles.map(rid => getRole(rid)).filter(role => role);

    const reject = !userRoles.some(role => _rejects(role, cid));
    const accept = userRoles.some(role => roleAccepts(role, cid));
    return reject && accept;
}

export async function checkEditPermissions(req: express.Request, cid?: string): Promise<boolean> {
    return hasPermission(computeAccess(req.user, getCollection(cid || req.params.cid)), EDIT_OTHER_COLLECTION);
}

export async function checkCreatePermissions(req: express.Request): Promise<boolean> {
    return hasPermission(computeAccess(req.user), CREATE_COLLECTION);
}

export async function getAvailableCollections(uid: string) { // used in middleware
    const flags = await Promise.all(collections.map(c => hasPermissions(uid, c.cid)));
    return collections.filter((c, i) => flags[i]);
}

async function getUID(req: express.Request): Promise<string | undefined> {
    const idToken = req.header("Authorization");
    const sessionCookie = req.cookies.session;
    let result;
    if (idToken) {
        if (!(result = idTokenCache.get(idToken))) {
            result = await auth().verifyIdToken(idToken);
            idTokenCache.set(idToken, result);
        }
        return result.uid;
    } else if (sessionCookie) {
        if (!(result = idTokenCache.get(sessionCookie))) {
            result = await auth().verifySessionCookie(sessionCookie, true);
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
        } else return res.json(error('login_expired'));
    } catch (e) {
        // await error({func: 'checkUserOptional', body: req.body, path: req.path});
        return res.json(error('login_expired'));
    }
}

export async function checkUserOptional(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            req.uid = uid;
            req.user = await getUser(uid);
        }
        return next();
    } catch (e) {
        // await error({func: 'checkUserOptional', body: req.body, path: req.path});
        return res.redirect("/logout");
    }
}

export async function checkPermissions(req: express.Request, res: express.Response, next: () => any) {
    if (await hasPermissions(req.uid!, req.params.cid)) return next();
    else return res.json(failed("not authorized"));
}

export async function checkAdmin(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            const user = await getUser(uid);
            if (!user) return false;
            if (user.admin) {
                req.uid = uid;
                req.user = await getUser(uid);
                return next();
            } else return res.json(failed("not admin"));
        } else return res.json(failed("not logged in"));
    } catch (e) {
        // await error({func: 'checkAdmin', body: req.body, path: req.path});
        return res.json(error('login_expired'));
    }
}

export function getCollection(cid: string): Collection | undefined { // heavy call function
    return collections.find(coll => coll.cid === cid);
}

export function setup(): [() => void, () => void, () => void] {
    // probably not very efficient
    return [firestore().collection('collections').onSnapshot(genQuerySnapshotHandler(c => c.cid, collections)),
        firestore().collection('roles').onSnapshot(genQuerySnapshotHandler(r => r.rid, roles)),
        firestore().collection('users').onSnapshot(genQuerySnapshotHandler(u => u.uid, users))];
}

export function genQuerySnapshotHandler<T>(getID: (el: T) => string, array: T[]): (querySnapshot: QuerySnapshot<DocumentData>) => void {
    return (querySnapshot: QuerySnapshot<DocumentData>) => {
        querySnapshot.docChanges().forEach(change => {
            const t = change.doc.data() as T;
            const id = getID(t);
            const index = array.findIndex(elem => getID(elem) === id);
            if (change.type === "added") {
                if (index !== -1) array[index] = t;
                else array.push(t);
            } else if (change.type === "removed" && index !== -1) array.splice(index, 1);
            else if (change.type === "modified") {
                if (index !== -1) array[index] = t;
                else array.push(t);
            }
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