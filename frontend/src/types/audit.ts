export enum Action {CREATE, EDIT, DELETE, EDIT_PERMISSION, EDIT_ROLES, UPLOAD_FILE, DELETE_FILE, ADMIN}

export enum Category {COLLECTION, NOTE, ROLE, USER}

export interface Entity {
    cat: Category,
    id: string,
    deleted?: boolean
}

export interface Audit {
    aid: string;
    cat: Category,
    type: Action,
    message: (Entity | string)[]; // markdown
    body?: (Entity | string)[]; // expand
    date: string; // formatted
}