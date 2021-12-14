import {User} from "./types/user";

declare global {
    namespace Express {
        export interface Request {
            uid?: string;
            user?: User;
        }
    }
}