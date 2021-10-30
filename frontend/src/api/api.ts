function post(path: string, body: any) {
    return fetch(path, {
        method: "POST",
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'CSRF-Token': ""
        }, body: JSON.stringify(body)
    });
}