import {fillUser, makeUser, User} from './types/user';
import {Role, roleAccepts} from './types/role';
import {Note} from "./types/note";
import {Collection} from "./types/coll";
import express from "express";
import admin, {auth, firestore} from "firebase-admin";
import {_accepts, _rejects} from "./types/permissions";
import DocumentSnapshot = admin.firestore.DocumentSnapshot;

const users: User[] = [];

export const getUsers = (): User[] => users;
const roles: Role[] = [];
const collections: Collection[] = [];
const noteCache: Map<string, {
    notes: Note[],
    cacheDate: number
}> = new Map();

export async function getUser(uid: string): Promise<User> { // heavy call function
    if (!uid) return null;
    const fbUser = await auth().getUser(uid);
    if (!fbUser) return null;
    let user = users.find(user => user.uid === uid);
    if (!user) {
        user = makeUser(fbUser.uid);
        await firestore().collection("users").doc(fbUser.uid).set(user);
    }
    return fillUser(user, fbUser);
}

export function findUserWithRole(rid: string): Promise<User[]> {
    return Promise.all(users.filter(u => u.roles.includes(rid)).map(u => getUser(u.uid)));
}

export function getRole(rid: string): Role { // heavy call function
    if (!rid) return null;
    return roles.find(role => role.rid === rid);
}

export async function updateUser(uid: string, value: User): Promise<User> {
    value.roles = [...new Set(value.roles)];
    updateUserCache(uid, value);
    if (value) await firestore().collection("users").doc(uid).set(value);
    else await firestore().collection("users").doc(uid).delete();
    return value;
}

export async function updateRole(rid: string, value: Role): Promise<Role> {
    updateRoleCache(rid, value);
    if (value) await firestore().collection("roles").doc(rid).set(value);
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

export function updateRoleCache(rid: string, value: Role) {
    if (value) {
        const index = roles.findIndex(role => role.rid === rid);
        roles[index] = value;
        if (index === -1) roles.push(value);
        else roles[index] = value;
    } else roles.splice(roles.findIndex(role => role.rid === rid), 1);
}

export function getAllRoles(): Role[] {
    return roles;
}

export async function getNote(cid: string, nid: string): Promise<Note> {
    return (await getNotes(cid)).find(note => note.nid === nid);
}

export async function getNotes(cid: string): Promise<Note[]> {
    let coll = noteCache.get(cid);
    if (!coll) {
        if (!getCollection(cid)) return null;
        const allNotes = await firestore().collection("collections").doc(cid).collection("notes").get();
        noteCache.set(cid, coll = {
            cacheDate: Date.now(),
            notes: allNotes.docs.map((doc: DocumentSnapshot) => doc.data() as Note)
        });
    }
    return coll.notes;
}

export function updateNote(cid: string, nid: string, note: Note) {
    const coll = noteCache.get(cid);
    if (!coll) return;
    if (note) {
        const index = coll.notes.findIndex(n => n.nid === nid);
        if (index === -1) coll.notes.push(note);
        else coll.notes[index] = note;
    } else coll.notes.splice(coll.notes.findIndex(n => n.nid === nid), 1);
}

// permission system in order of priority
// 1) user defined (per-user-permissions, user.additional)
// 2) collection defined as open
// 3) role rejection (specified not allow)
// 4) role acceptance (specified allow)
// 5) role default (default allow) there is no default reject
export async function hasPermissions(uid: string, cid: string) { // used in middleware
    const user = await getUser(uid);
    if (!user) return false;
    const collection = getCollection(cid);
    if (user.admin) return true; // well, here we go, an admin
    if (_accepts(user, cid)) return true;
    if (_rejects(user, cid)) return false;
    if (collection.open) return true;
    const userRoles = user.roles.map(rid => getRole(rid)).filter(role => !(!role));

    const reject = !userRoles.some(role => _rejects(role, cid));
    const accept = userRoles.some(role => roleAccepts(role, cid));
    return reject && accept;
}

export function getAvailableCollections(uid: string) { // used in middleware
    return collections.filter(c => hasPermissions(uid, c.cid));
}

async function getUID(req: express.Request) {
    const idToken = req.header("Authorization");
    const sessionCookie = req.cookies.session;
    if (idToken) return (await auth().verifyIdToken(idToken)).uid;
    else if (sessionCookie) return (await auth().verifySessionCookie(sessionCookie, true)).uid;
    else return null;
}

export async function checkUser(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            req.body.cuid = uid;
            req.body.user = await getUser(uid);
            return next();
        } else return res.redirect('/login');
    } catch (e) {
        // await error({func: 'checkUserOptional', body: req.body, path: req.path});
        return res.redirect('/login');
    }
}

export async function checkUserOptional(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            req.body.cuid = uid;
            req.body.user = await getUser(uid);
        }
        return next();
    } catch (e) {
        // await error({func: 'checkUserOptional', body: req.body, path: req.path});
        return res.redirect("/logout");
    }
}

export async function checkPermissions(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            if (await hasPermissions(uid, req.params.cid)) return next();
            else return res.status(403).send("not authorized");
        } else return res.status(403).send("not logged in");
    } catch (e) {
        // await error({func: 'checkPermissions', body: req.body, path: req.path});
        return res.redirect('/login');
    }
}

export async function checkAdmin(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            const user = await getUser(uid);
            if (user.admin === true) {
                req.body.cuid = uid;
                req.body.user = await getUser(uid);
                return next();
            } else return res.status(403).send("not admin");
        } else return res.status(403).send("not logged in");
    } catch (e) {
        // await error({func: 'checkAdmin', body: req.body, path: req.path});
        return res.redirect('/login');
    }
}

export function getCollection(cid: string): Collection { // heavy call function
    if (!cid) return null;
    return collections.find(coll => coll.cid === cid);
}

export function setup(): [() => void, () => void, () => void] {
    // probably not very efficient
    collections.splice(0, collections.length);
    roles.splice(0, roles.length);
    users.splice(0, users.length);
    return [firestore().collection('collections').onSnapshot(querySnapshot => querySnapshot.docChanges().forEach(change => {
        const cid = change.doc.data().cid;
        if (change.type === "added") collections.push(change.doc.data() as Collection);
        else if (change.type === "removed") collections.splice(collections.findIndex(coll => coll.cid === cid), 1);
        else if (change.type === "modified") collections[collections.findIndex(coll => coll.cid === cid)] = change.doc.data() as Collection;
    })), firestore().collection('roles').onSnapshot(querySnapshot => querySnapshot.docChanges().forEach(change => {
        const rid = change.doc.data().rid;
        if (change.type === "added") roles.push(change.doc.data() as Role);
        else if (change.type === "removed") roles.splice(roles.findIndex(role => role.rid === rid), 1);
        else if (change.type === "modified") roles[roles.findIndex(role => role.rid === rid)] = change.doc.data() as Role;
    })), firestore().collection('users').onSnapshot(querySnapshot => querySnapshot.docChanges().forEach(change => {
        const uid = change.doc.data().uid;
        if (change.type === "added") users.push(change.doc.data() as User);
        else if (change.type === "removed") users.splice(users.findIndex(user => user.uid === uid), 1);
        else if (change.type === "modified") users[users.findIndex(user => user.uid === uid)] = change.doc.data() as User;
    }))];
}