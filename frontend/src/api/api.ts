export function get(path: string) {
    return fetch(path, {
        method: "GET",
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
            'Content-Type': 'application/json'
        }, body: JSON.stringify(body)
    });
}