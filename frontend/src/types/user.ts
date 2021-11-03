import {MutablePermissions} from "./permissions";

export const CREATE_COLLECTION = 0b0001;
export const VIEW_OTHER_COLLECTION = 0b0010;
export const EDIT_OTHER_COLLECTION = 0b0100;
export const IDK_YET = 0b1000;

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