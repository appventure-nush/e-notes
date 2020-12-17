import User from './types/user';
import Role from './types/role';
// import Note from "./types/note";
import Collection from "./types/coll";
import express from "express";
import {auth, firestore} from "firebase-admin";
// running two at the same time is a bad idea
// using cache system to reduce reads, idk about write
// writes shouldn't be that heavy
// but reads is HEAVY
const CACHE_AGE = 1000 * 60 * 60 * 24; // 1 day
import {info, error} from './logger';

let lastFullRoleRefresh = 0;
const userCache = new Map<string, [User, number]>();
const roleCache = new Map<string, [Role, number]>();
const collections: Collection[] = [];
// const collCache = new Map<string, [Collection, number]>();
// const noteCache = new Map<string, [Note, number]>();

export async function getUser(uid: string): Promise<User> { // heavy call function
    if (!uid) return null;
    if (userCache.has(uid)) {
        const cache = userCache.get(uid);
        if (Date.now() - cache[1] <= CACHE_AGE) return cache[0]; // else carry on
    }
    const user = await auth().getUser(uid);
    const userDoc = await firestore().collection("users").doc(user.uid).get();
    let userObj: User;
    if (!userDoc.exists) {
        userObj = new User(user.uid);
        await userDoc.ref.set(userObj.toData());
    } else userObj = new User(userDoc.data());
    userCache.set(user.uid, [userObj, Date.now()]);
    return userObj;
}

export async function getRole(rid: string): Promise<Role> { // heavy call function
    if (!rid) return null;
    if (roleCache.has(rid)) {
        const cache = roleCache.get(rid);
        if (Date.now() - cache[1] <= CACHE_AGE) return cache[0]; // else carry on
    }
    const roleDoc = await firestore().collection("roles").doc(rid).get();
    if (!roleDoc.exists) return null;
    const role = new Role(roleDoc.data());
    roleCache.set(role.rid, [role, Date.now()]);
    return role;
}

export async function updateUser(userId: string, value: User) {
    updateUserCache(userId, value);
    if (value) await firestore().collection("users").doc(userId).set(value.toData());
    else await firestore().collection("users").doc(userId).delete();
    return value;
}

export async function updateRole(rid: string, value: Role) {
    updateRoleCache(rid, value);
    if (value) await firestore().collection("roles").doc(rid).set(value.toData());
    else await firestore().collection("roles").doc(rid).delete();
    return value;
}

export function updateUserCache(userId: string, value: User) {
    if (value) userCache.set(userId, [value, Date.now()]);
    else userCache.delete(userId);
}

export function updateRoleCache(rid: string, value: Role) {
    if (value) roleCache.set(rid, [value, Date.now()]);
    else roleCache.delete(rid);
}

export async function getAllRoles(): Promise<Role[]> {
    if (Date.now() - lastFullRoleRefresh <= CACHE_AGE) return Array.from(roleCache.values()).map(([value]) => value);
    const roleDocs = (await firestore().collection("roles").get()).docs;
    const roles: Role[] = [];
    for (const roleDoc of roleDocs) {
        const role = new Role(roleDoc.data());
        roleCache.set(role.rid, [role, Date.now()]);
        roles.push(role);
    }
    lastFullRoleRefresh = Date.now();
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
        return res.status(403).send("authorization invalid");
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

export function setup() {
    firestore().collection('collections').onSnapshot(querySnapshot => collections.splice(0, collections.length, ...querySnapshot.docs.map(doc => new Collection(doc.data()))));
    auth();
}

function mapAsync<T, U>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<U>): Promise<U[]> {
    return Promise.all(array.map(callback));
}

async function filterAsync<T>(array: T[], callback: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<T[]> {
    const filterMap = await mapAsync(array, callback);
    return array.filter((value, index) => filterMap[index]);
}