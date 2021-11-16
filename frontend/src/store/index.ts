import Vue from 'vue'
import Vuex from 'vuex'
import {auth} from "@/main";
import router from "@/router";
import {State} from "@/shims-vuex";
import {get, post} from "@/mixins/api";
import {User} from "@/types/user";
import VuexPersistence from 'vuex-persist';
import {Collection} from "@/types/coll";
import {Note} from "@/types/note";
import {Role} from "@/types/role";
import createCache from 'vuex-cache';
import {FirebaseUser} from "@/shims-firebase-user";

Vue.use(Vuex)
const vuexLocal = new VuexPersistence<State>({
    storage: window.localStorage
})

const store = new Vuex.Store<State>({
    state: {
        dark: false,
        user: undefined,
        profile: <User>{},
        currentNotes: <Note[]>[],
        currentRoles: <Role[]>[],
        collections: <Collection[]>[],

        drawerOpen: false,
        collectionListOpen: false,

        currentNote: <Note>{},
        currentCollection: <Collection>{},

        markdownOptions: {
            markdownIt: {
                html: true
            }
        }
    },
    mutations: {
        toggleDark(state) {
            state.dark = !state.dark;
        },
        setUser(state, user?: FirebaseUser) {
            state.user = user;
        },
        setProfile(state, user?: User | any) {
            state.profile = user;
        },
        setCurrentNotes(state, notes: Note[]) {
            state.currentNotes = notes;
        },
        setCurrentRoles(state, roles: Role[]) {
            state.currentRoles = roles;
        },
        setCurrentNote(state, note: Note) {
            state.currentNote = note;
        },
        setCurrentColl(state, coll: Collection) {
            state.currentCollection = coll;
        },
        setDrawer(state, open) {
            state.drawerOpen = open;
        },
        collections(state, collections: Collection[]) {
            state.collections = collections;
        }
    },
    actions: {
        async fetchUserProfile({commit, dispatch}) {
            const profile = await get("/api/auth").then(res => res.json());
            if (profile.status === 'failed') {
                try {
                    if (auth.currentUser) dispatch("verifyToken", await auth.currentUser.getIdToken(true));
                    else dispatch("logout");
                } catch (e) {
                    dispatch("logout");
                }
            } else {
                commit("setProfile", profile);
                if (router.currentRoute.path === "/login") router.push("/");
            }
        },
        async logout({commit}) {
            await auth.signOut();
            await get("/api/auth/logout");
            this.cache.clear();
            commit("collections", undefined);
            commit("setProfile", undefined);
            commit("setUser", undefined);
            router.push('/login');
        },
        verifyToken({commit, dispatch}, token: string) {
            commit('setUser', auth.currentUser);
            return post("/api/auth", {token: token}).then(res => res.json()).then(res => {
                if (res.status === "success") dispatch("fetchUserProfile");
                else throw res.reason;
            });
        },
        getUsers: () => get("/api/users").then(res => res.json()).then(successFilter),
        getRoles: () => get("/api/roles").then(res => res.json()).then(successFilter),
        getCollections: () => get("/api/collections").then(res => res.json()).then(successFilter),
        getUser: (_, uid: string) => get(`/api/users/${uid}`).then(res => res.json()).then(successFilter),
        getCollection: (_, cid: string) => get(`/api/collections/${cid}`).then(res => res.json()).then(successFilter),
        getCollectionNotes: (_, cid: string) => get(`/api/collections/${cid}/notes`).then(res => res.json()).then(successFilter),
        getCollectionRoles: (_, cid: string) => get(`/api/collections/${cid}/roles`).then(res => res.json()).then(successFilter),
        getCollectionImages: (_, cid: string) => get(`/api/collections/${cid}/img`).then(res => res.json()).then(successFilter),
    },
    modules: {},
    plugins: [vuexLocal.plugin, createCache({timeout: 60 * 60 * 1000})]
})
export default store;

function successFilter<T extends { status?: string, reason?: string }>(json: T) {
    if (json.status && json.status !== 'success') throw new Error(json.reason); else return json;
}

export function cached(type: string, payload?: any): Promise<any> {
    return store.cache.dispatch(type, payload).catch(e => {
        store.cache.delete(type, payload)
        throw e;
    })
}

export function storeTo(type: string, payload?: any) {
    return store.commit(type, payload);
}
