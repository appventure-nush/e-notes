// TODO add more api functions
const cacheAge = 1000 * 60 * 5; // 5 minute is fine ig
const userCache = JSON.parse(localStorage.getItem("userCache") || '{}');
const collCache = JSON.parse(localStorage.getItem("collCache") || '{}');
// i dont even care about multiple windows open at same time
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const collections = {
    get: async function (cid) {
        cid = String(cid);
        if (collCache[cid] && Date.now() - collCache[cid].time < cacheAge) {
            return collCache[cid].coll;
        }
        // '/' is actually allowed uwu
        let coll = await fetcher(`/api/collections/${cid}`)
        collCache[coll.cid] = {coll, time: Date.now()};
        localStorage.setItem("collCache", JSON.stringify(collCache));
        return coll;
    },
    getAll: function (useCache) {
        if (useCache && Object.values(collCache).length > 0) return Object.values(collCache).map(cache => cache.coll);
        return fetcher("/api/collections").then(colls => { // this will disregard any cache the client currently has
            for (let coll of colls) collCache[coll.cid] = {coll, time: Date.now()};
            localStorage.setItem("collCache", JSON.stringify(collCache));
            return colls;
        });
    }
};
const users = {
    get: async function (uid) {
        uid = String(uid);
        if (userCache[uid] && Date.now() - userCache[uid].time < cacheAge) {
            return userCache[uid].user;
        }
        // '/' is actually allowed uwu
        let user = await fetcher(`/api/users/${uid}`)
        userCache[user.uid] = {user, time: Date.now()};
        localStorage.setItem("userCache", JSON.stringify(userCache));
        return user;
    },
    getAll: function (useCache) {
        if (useCache && Object.values(userCache).length > 0) return Object.values(userCache).map(cache => cache.user);
        return fetcher("/api/users").then(users => { // this will disregard any cache the client currently has
            users = users.users;
            for (let user of users) userCache[user.uid] = {user, time: Date.now()};
            localStorage.setItem("userCache", JSON.stringify(userCache));
            return users;
        });
    },
}

function updateOptions(options) {
    const update = {...options};
    update.headers = {
        ...update.headers,
        'CSRF-Token': token
    };
    update.credentials = 'include';
    return update;
}

function fetcher(url, options) {
    return fetch(url, updateOptions(options)).then(res => res.json());
}

function fetchJSON(url, options) {
    options.headers['Content-Type'] = 'application/json';
    return fetch(url, updateOptions(options)).then(res => res.json());
}

function clearCache() {
    localStorage.removeItem("userCache");
    localStorage.removeItem("collCache");
}

Object.freeze(collections);
Object.freeze(users);
window.collections = collections;
window.users = users;