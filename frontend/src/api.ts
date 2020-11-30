export function fetcher(url: string, options?: any) {
  return fetch( "http://localhost:8080"+url, updateOptions(options)).then(res => res.json());
}

function updateOptions(options?: any) {
  const update = {...options};
  if (localStorage.jwt) {
    update.headers = {...update.headers, 'Authorization': localStorage.jwt};
    if (!update.headers['Content-Type']) update.headers['Content-Type'] = 'application/json';
  }
  return update;
}
