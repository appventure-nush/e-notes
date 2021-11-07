export function get(path: string) {
    return fetch(path, {
        method: "GET",
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json'
        }
    });
}

export function del(path: string) {
    return fetch(path, {
        method: "DELETE",
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json'
        }
    });
}

export function post(path: string, body: any) {
    return fetch(path, {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': (body instanceof FormData) ? 'multipart/form-data' : 'application/json'
        }, body: (body instanceof FormData) ? body : JSON.stringify(body)
    });
}