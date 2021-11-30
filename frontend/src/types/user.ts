import {MutablePermissions} from "./permissions";

export const VIEW_OTHER_COLLECTION = 0b001;
export const EDIT_OTHER_COLLECTION = 0b010;
export const CREATE_COLLECTION = 0b100;
export const IDK_YET = 0b1000;

export const TEACHER_PERMISSION = CREATE_COLLECTION;

export const ADMIN_PERMISSION = CREATE_COLLECTION | VIEW_OTHER_COLLECTION | EDIT_OTHER_COLLECTION;

export const permissions = {
    "Create": CREATE_COLLECTION,
    "View All": VIEW_OTHER_COLLECTION,
    "Edit All": EDIT_OTHER_COLLECTION
};

export interface User extends MutablePermissions {
    uid: string;

    nickname?: string;
    desc?: string;
    roles: string[];
    name?: string;
    email?: string;
    pfp?: string;
    verified?: boolean;
    admin: boolean;
    access?: number;
    teacher: boolean;
    has_control_over?: string[];
}