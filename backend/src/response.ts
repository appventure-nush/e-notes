export enum MESSAGES {
    NOT_LOGGED_IN,
}

export function success(obj?: any): object {
    if (typeof obj === "string") return {status: "success", message: obj};
    return {status: "success", ...obj};
}

export function failed(obj?: any): object {
    if (typeof obj === "string") return {status: "failed", reason: obj};
    return {status: "failed", ...obj};
}

export function error(obj?: any): object {
    if (typeof obj === "string") return {status: "error", message: obj};
    return {status: "error", ...obj};
}