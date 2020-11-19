export function fetcher(url: string, options?: any) {
  return fetch(url, updateOptions(options)).then(res => res.json());
}

function updateOptions(options?: any) {
  const update = {...options};
  if (localStorage.jwt) {
    update.headers = {...update.headers, 'Authorization': localStorage.jwt};
    if (!update.headers['Content-Type']) update.headers['Content-Type'] = 'application/json';
  }
  return update;
}

async function fetchUsers(item: { children: Array<any> }) {
  return fetcher("/api/users")
    .then(json => item.children.push(...json))
    .catch(err => console.warn(err))
}
