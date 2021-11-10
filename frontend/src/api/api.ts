let csrfToken = "";

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
            'Accept': 'application/json',
            'x-xsrf-token': csrfToken
        }
    });
}

export function post(path: string, body: any) {
    return fetch(path, {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'x-xsrf-token': csrfToken,
            ...(body instanceof FormData ? {} : {'Content-Type': 'application/json'})
        }, body: (body instanceof FormData) ? body : JSON.stringify(body)
    });
}

get('/api/csrf').then(res => res.json()).then(json => csrfToken = json.token);