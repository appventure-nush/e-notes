import {MutablePermissions} from "@/types/permissions";

export interface Role extends MutablePermissions {
    rid: string;
    name: string;
    desc: string;
    defaultPerm: boolean;
}