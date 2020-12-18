import User from './types/user';
import Role from './types/role';
// import Note from "./types/note";
import Collection from "./types/coll";
import express from "express";
import {auth, firestore} from "firebase-admin";
import {error} from './logger';

let users: User[] = [];
let roles: Role[] = [];
let collections: Collection[] = [];

export async function getUser(uid: string): Promise<User> { // heavy call function
    if (!uid) return null;
    const user = await auth().getUser(uid);
    if (!user) return null;
    let userObj = users.find(user => user.uid === uid);
    if (!userObj) {
        userObj = new User(user.uid);
        await firestore().collection("users").doc(user.uid).set(userObj.toData());
    }
    return userObj;
}

export async function getRole(rid: string): Promise<Role> { // heavy call function
    if (!rid) return null;
    return roles.find(role => role.rid === rid);
}

export async function updateUser(uid: string, value: User) {
    updateUserCache(uid, value);
    if (value) await firestore().collection("users").doc(uid).set(value.toData());
    else await firestore().collection("users").doc(uid).delete();
    return value;
}

export async function updateRole(rid: string, value: Role) {
    updateRoleCache(rid, value);
    if (value) await firestore().collection("roles").doc(rid).set(value.toData());
    else await firestore().collection("roles").doc(rid).delete();
    return value;
}

export function updateUserCache(uid: string, value: User) {
    if (value) users[users.findIndex(user => user.uid === uid)] = value;
    else users.splice(users.findIndex(user => user.uid === uid), 1);
}

export function updateRoleCache(rid: string, value: Role) {
    if (value) roles[roles.findIndex(role => role.rid === rid)] = value;
    else roles.splice(roles.findIndex(role => role.rid === rid), 1);
}

export function getAllRoles(): Role[] {
    return roles;
}

// permission system in order of priority
// 1) user defined (per-user-permissions, user.additional)
// 2) collection defined as open
// 3) role rejection (specified not allow)
// 4) role acceptance (specified allow)
// 5) role default (default allow) there is no default reject
export async function hasPermissions(uid: string, cid: string) { // used in middleware
    const user = await getUser(uid);
    const collection = collections.find(coll => coll.cid === cid);
    if (user.admin) return true; // well, here we go, an admin
    if (user.accepts(cid)) return true;
    if (user.rejects(cid)) return false;
    if (collection.open) return true;
    const roles = await Promise.all(user.roles.map(rid => getRole(rid)));
    return (!roles.some(role => role.rejects(cid))) && roles.some(role => role.accepts(cid));
}

export function getAvailableCollections(uid: string) { // used in middleware
    return filterAsync(collections, c => hasPermissions(uid, c.cid));
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
            req.body.user = transformUser(await getUser(uid), await auth().getUser(uid));
            return next();
        } else return res.status(403).send("not logged in");
    } catch (e) {
        await error('auth failed', {func: 'checkUserOptional', body: req.body, path: req.path});
        return res.status(403).send("authorization invalid");
    }
}

export async function checkUserOptional(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            req.body.cuid = uid;
            req.body.user = transformUser(await getUser(uid), await auth().getUser(uid));
        }
        return next();
    } catch (e) {
        await error('auth failed', {func: 'checkUserOptional', body: req.body, path: req.path});
        return res.redirect("/logout");
    }
}

export async function checkPermissions(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            if (await hasPermissions(uid, uid)) return next();
            else return res.status(403).send("not authorized");
        } else return res.status(403).send("not logged in");
    } catch (e) {
        await error('auth failed', {func: 'checkPermissions', body: req.body, path: req.path});
        return res.status(403).send("authorization invalid");
    }
}

export async function checkAdmin(req: express.Request, res: express.Response, next: () => any) {
    try {
        const uid = await getUID(req);
        if (uid) {
            if ((await getUser(uid)).admin === true) return next();
            else return res.status(403).send("not admin");
        } else return res.status(403).send("not logged in");
    } catch (e) {
        await error('auth failed', {func: 'checkAdmin', body: req.body, path: req.path});
        return res.status(403).send("authorization invalid");
    }
}

export function transformUser(user: User, fbUser: auth.UserRecord) {
    const data = user.toData() as any;
    data.email = fbUser.email;
    data.name = fbUser.displayName;
    data.pfp = fbUser.photoURL;
    return data;
}

export function getCollection(cid: string): Collection { // heavy call function
    if (!cid) return null;
    return collections.find(coll => coll.cid === cid);
}

export async function setup() {
    // probably not very efficient
    firestore().collection('collections').onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            let cid = change.doc.data().cid;
            if (change.type === "added") collections.push(new Collection(change.doc.data()));
            else if (change.type === "removed") collections.splice(collections.findIndex(coll => coll.cid === cid), 1);
            else if (change.type === "modified") collections[collections.findIndex(coll => coll.cid === cid)] = new Collection(change.doc.data());
        });
    });
    firestore().collection('roles').onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            let rid = change.doc.data().rid;
            if (change.type === "added") roles.push(new Role(change.doc.data()));
            else if (change.type === "removed") roles.splice(roles.findIndex(role => role.rid === rid), 1);
            else if (change.type === "modified") roles[roles.findIndex(role => role.rid === rid)] = new Role(change.doc.data());
        });
    });
    firestore().collection('users').onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
            let uid = change.doc.data().uid;
            if (change.type === "added") users.push(new User(change.doc.data()));
            else if (change.type === "removed") users.splice(users.findIndex(user => user.uid === uid), 1);
            else if (change.type === "modified") users[users.findIndex(user => user.uid === uid)] = new User(change.doc.data());
        });
    });
}

function mapAsync<T, U>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<U>): Promise<U[]> {
    return Promise.all(array.map(callback));
}

async function filterAsync<T>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<T[]> {
    const filterMap = await mapAsync(array, callback);
    return array.filter((value, index) => filterMap[index]);
}