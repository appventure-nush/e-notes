import {User} from "@/types/user";

let csrfToken = "";

export function get<T>(path: string): Promise<T> {
    return fetch(path, {
        method: "GET",
        credentials: 'same-origin',
        headers: {'Accept': 'application/json'}
    }).then(res => res.json()).then(successFilter);
}

export function del<T>(path: string): Promise<T> {
    return fetch(path, {
        method: "DELETE",
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'x-xsrf-token': csrfToken
        }
    }).then(res => res.json()).then(successFilter);
}

export function post<T>(path: string, body: any): Promise<T> {
    return fetch(path, {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'x-xsrf-token': csrfToken,
            ...(body instanceof FormData ? {} : {'Content-Type': 'application/json'})
        }, body: (body instanceof FormData) ? body : JSON.stringify(body)
    }).then(res => res.json()).then(successFilter);
}

function successFilter<T extends { status?: string, reason?: string }>(json: T) {
    if (json && json.status && json.status !== 'success') throw new Error(json.reason);
    else return json as T;
}

export function getToken() {
    return csrfToken; //bit unsafe but whatever, it cant do much against real attacks anyways
}

export function verifyToken(token: string) {
    return post("/api/auth", {token: token}).then(() => get<User>("/api/auth"));
}

get<{ token: string }>('/api/csrf').then(json => csrfToken = json.token);