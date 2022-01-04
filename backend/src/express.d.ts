import {User} from "./types/user";
import {UploadedFile} from "express-fileupload";

declare global {
    namespace Express {
        export interface Request {
            uid?: string;
            user?: User;
            approvedImage?: UploadedFile
        }
    }
}