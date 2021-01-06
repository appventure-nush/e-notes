// TODO add more api functions
var cache = {};
// i dont even care about multiple windows open at same time
var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

function generateAPI(key, idKey, path) {
    try {
        cache[key] = JSON.parse(localStorage.getItem(key) || '[]');
        if (!Array.isArray(cache[key])) cache[key] = [];
    } catch (e) {
        localStorage.setItem(key, JSON.stringify(cache[key] = []));
    }
    return {
        update: function (id, value) {
            var index = cache[key].findIndex(item => item[idKey] === id);
            if (index === -1) {
                if (value) cache[key].push(value);
            } else if (value) cache[key][index] = value;
            else cache[key].splice(index, 1);
            localStorage.setItem(key, JSON.stringify(cache[key]));
            return value;
        },
        get: async function (id) {
            if (!id) return null;
            var item = cache[key].find(item => item[idKey] === id);
            if (item) return item;
            item = await fetcher(`/api/${path}/${id}`)
            if (item.reason) alert(item.reason); else update(id, item);
            return item;
        },
        getAll: async function (useCache = true) {
            if (!useCache || !cache[key] || cache[key].length === 0) try {
                console.log("getting latest " + path + "...");
                if (key === 'userCache') localStorage.setItem(key, JSON.stringify(cache[key] = Array.from((await fetcher(`/api/${path}`)).users)));
                else localStorage.setItem(key, JSON.stringify(cache[key] = Array.from(await fetcher(`/api/${path}`))));
            } catch (e) {
                console.log(e)
                localStorage.setItem(key, JSON.stringify(cache[key] = []));
            }
            return cache[key];
        }
    };
}

var collections = generateAPI('collCache', 'cid', 'collections');
var users = generateAPI('userCache', 'uid', 'users');
var roles = generateAPI('roleCache', 'rid', 'roles');
var notes = {
    get: async function (cid, rid) {
        if (!cid) return null;
        var note = await fetcher(`/api/collections/${cid}/notes/${rid}`)
        if (note.reason) note = null;
        return note;
    },
    getAll: async function (cid) {
        return Array.from(await fetcher(`/api/collections/${cid}/notes`));
    }
};

function updateOptions(options) {
    var update = {...options};
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
    localStorage.removeItem("roleCache");
    cache = {};
}

Object.freeze(collections);
Object.freeze(users);
Object.freeze(notes);
Object.freeze(roles);
window.collections = collections;
window.users = users;
window.notes = notes;
window.roles = roles;
window.fetcher = fetcher;
