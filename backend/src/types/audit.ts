import {Collection} from "./coll";
import moment from "moment";
import {firestore} from "firebase-admin";
import DocumentReference = firestore.DocumentReference;
import Timestamp = firestore.Timestamp;

export enum Action {CREATE, EDIT, DELETE, EDIT_PERMISSION, EDIT_ROLES, UPLOAD_FILE, DELETE_FILE, ADMIN}

const ACTION_NAMES = ["created", "edited", "deleted"]

export enum Category {COLLECTION, NOTE, ROLE, USER}

export interface Audit {
    cat: Category;
    type: Action;
    aid: string;
    time: Timestamp;
    actor: string;
    users: string[];
    colls: string[];
    notes: string[];
    roles: string[];
    extra: any[];
}

export type AuditPartial = Partial<Audit>;
const CAT_NAMES = ["Collection", "Note", "Role", "User"];
const CAT_KEYS: ["colls", "notes", "roles", "users"] = ["colls", "notes", "roles", "users"];

interface Entity {
    cat: Category,
    id: string,
    deleted?: boolean
}

export interface Rendered {
    aid: string;
    cat: Category,
    type: Action,
    message: (Entity | string)[]; // markdown
    body?: (Entity | string)[]; // expand
    date: string; // formatted
}

export function makeAudit(uid: string, assign: AuditPartial): Audit {
    let audit: Audit = {
        actor: uid,
        aid: null,
        cat: null,
        colls: [],
        extra: [],
        notes: [],
        roles: [],
        time: Timestamp.now(),
        type: null,
        users: []
    };
    Object.assign(audit, assign);
    return audit;
}

export function simpleAudit(uid: string, id: string, cat: Category, type: Action, extra?: any[], assign?: AuditPartial): Audit {
    let audit: Audit = {
        actor: uid,
        aid: null,
        cat: cat,
        colls: [],
        extra,
        notes: [],
        roles: [],
        time: Timestamp.now(),
        type: type,
        users: []
    };
    audit[CAT_KEYS[cat]].push(id);
    Object.assign(audit, assign);
    return audit;
}

export function renderAudit(audit: Audit): Rendered {
    if (audit.type === Action.CREATE || audit.type === Action.EDIT || audit.type === Action.DELETE) return {
        aid: audit.aid,
        cat: audit.cat,
        type: audit.type,
        date: moment(audit.time.toMillis()).format("YYYY MMM D, HH:mm:ss"),
        message: [{
            cat: Category.USER,
            id: audit.actor
        }, ACTION_NAMES[audit.type] + " " + CAT_NAMES[audit.cat],
            {
                cat: audit.cat,
                id: audit[CAT_KEYS[audit.cat]][0], ...audit.cat === Category.NOTE ? {cid: audit.colls[0]} : {},
                deleted: audit.type === Action.DELETE
            },
            ...audit.cat === Category.NOTE ? ["in collection", {cat: Category.COLLECTION, id: audit.colls[0]}] : [],
        ],
        ...audit.extra && audit.extra.length > 0 ? {body: audit.extra.map(e => `<pre>${JSON.stringify(e, null, 4)}</pre>`)} : {}
    }; else if (audit.type === Action.EDIT_PERMISSION) return {
        aid: audit.aid,
        cat: audit.cat,
        type: audit.type,
        date: moment(audit.time.toMillis()).format("YYYY MMM D, HH:mm:ss"),
        message: [{
            cat: Category.USER,
            id: audit.actor
        }, " edited permission of ", {cat: audit.cat, id: audit[CAT_KEYS[audit.cat]][0]}],
        body: audit.extra
    }; else if (audit.type === Action.EDIT_ROLES) return {
        aid: audit.aid,
        cat: audit.cat,
        type: audit.type,
        date: moment(audit.time.toMillis()).format("YYYY MMM D, HH:mm:ss"),
        message: [{
            cat: Category.USER,
            id: audit.actor
        }, " changed roles of user ", {cat: Category.USER, id: audit.users[0]}],
        body: ["added role(s)", ...audit.extra[0].new.filter((s: any) => !audit.extra[0].old.includes(s)).map((r: any) => ({
            cat: Category.ROLE, id: r, deleted: true
        })), "removed role(s)", ...audit.extra[0].old.filter((s: any) => !audit.extra[0].new.includes(s)).map((r: any) => ({
            cat: Category.ROLE, id: r, deleted: true
        }))]
    }; else if (audit.type === Action.UPLOAD_FILE) return {
        aid: audit.aid,
        cat: audit.cat,
        type: audit.type,
        date: moment(audit.time.toMillis()).format("YYYY MMM D, HH:mm:ss"),
        message: [{
            cat: Category.USER,
            id: audit.actor
        }, " uploaded ", audit.extra[0]],
        body: audit.extra
    };
    return {
        aid: audit.aid,
        cat: audit.cat,
        type: audit.type,
        date: moment(audit.time.toMillis()).format("YYYY MMM D, HH:mm:ss"),
        message: [`audit.${audit.aid}.${audit.cat}.${audit.type}.users{${audit.users.join(",")}}.colls{${audit.colls.join(",")}}.roles{${audit.roles.join(",")}}.notes{${audit.notes.join(",")}}`]
    };
}

export function addAudit(audit: Audit) {
    let ref: DocumentReference;
    if (!audit.aid) audit.aid = (ref = firestore().collection("audits").doc()).id;
    else ref = firestore().collection("audits").doc(audit.aid);
    return ref.set(audit);
}

export async function getAudit(aid: string): Promise<Audit> {
    return (await firestore().collection("audits").doc(aid).get()).data() as Audit;
}

export async function getAudits(lastID?: string, pageSize: number = 32, order: "asc" | "desc" = "desc"): Promise<Audit[]> {
    let query = firestore().collection("audits").orderBy("time", order);
    if (lastID) query = query.startAfter(await firestore().collection("audits").doc(lastID).get());
    return (await query.limit(pageSize).get()).docs.map(doc => doc.data() as Audit);
}

