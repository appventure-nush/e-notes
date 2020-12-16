// TODO add more api functions
const cacheAge = 1000 * 60 * 60; // 1 hour is fine ig
let userCache;
let collCache;
try {
    userCache = JSON.parse(localStorage.getItem("userCache") || '{}');
    collCache = JSON.parse(localStorage.getItem("collCache") || '{}');
} catch (e) {
    userCache = {};
    collCache = {};
    localStorage.setItem("userCache", JSON.stringify(userCache));
    localStorage.setItem("collCache", JSON.stringify(collCache));
}
// i dont even care about multiple windows open at same time
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const collections = {
    update: function (coll) {
        collCache[coll.cid] = {coll, time: Date.now()};
        localStorage.setItem("collCache", JSON.stringify(collCache));
        return coll;
    },
    delete: function (cid) {
        delete collCache[cid];
        console.log(collCache);
        localStorage.setItem("collCache", JSON.stringify(collCache));
    },
    get: async function (cid) {
        if (!cid) return null;
        cid = String(cid);
        if (collCache[cid] && Date.now() - collCache[cid].time < cacheAge) {
            return collCache[cid].coll;
        }
        // '/' is actually allowed uwu
        let coll = await fetcher(`/api/collections/${cid}`)
        if (coll.reason) {
            delete collCache[cid];
            coll = null;
        } else collCache[coll.cid] = {coll, time: Date.now()};
        localStorage.setItem("collCache", JSON.stringify(collCache));
        return coll;
    },
    getAll: async function (useCache = true) {
        for (let cache of Object.values(collCache)) // update expired cache
            if (Date.now() - cache.time >= cacheAge) {
                await this.get(cache.coll.cid);
            }
        if (useCache && Object.values(collCache).length > 0) return Object.values(collCache).map(cache => cache.coll);
        const colls = Array.from(await fetcher("/api/collections"));
        for (let coll of colls) collCache[coll.cid] = {coll, time: Date.now()};
        localStorage.setItem("collCache", JSON.stringify(collCache));
        return colls;
    }
};
const notes = {
    get: async function (cid, rid) {
        if (!cid) return null;
        cid = String(cid);
        rid = String(rid);
        let note = await fetcher(`/api/collections/${cid}/notes/${rid}`)
        if (note.reason) note = null;
        return note;
    },
    getAll: async function (cid) {
        return Array.from(await fetcher(`/api/collections/${cid}/notes`));
    }
};
const users = {
    get: async function (uid) {
        uid = String(uid);
        if (userCache[uid] && Date.now() - userCache[uid].time < cacheAge) {
            return userCache[uid].user;
        }
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
Object.freeze(notes);
window.collections = collections;
window.users = users;
window.notes = notes;
window.fetcher = fetcher;
