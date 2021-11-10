import Vue from 'vue'
import Vuex from 'vuex'
import {auth} from "@/main";
import router from "@/router";
import firebase from "firebase/compat";
import {State} from "@/shims-vuex";
import {get} from "@/mixins/api";
import {User} from "@/types/user";
import VuexPersistence from 'vuex-persist';
import {Collection} from "@/types/coll";
import {Note} from "@/types/note";
import {Role} from "@/types/role";
import createCache from 'vuex-cache';

Vue.use(Vuex)
const vuexLocal = new VuexPersistence<State>({
    storage: window.localStorage
})

export default new Vuex.Store<State>({
    state: {
        dark: false,
        user: <firebase.User>{},
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
        setUser(state, user?: firebase.User) {
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
        async fetchUserProfile({commit, dispatch}, payload: firebase.User) {
            commit("setUser", payload);
            const profile = await get("/api/auth").then(res => res.json());
            if (profile.status && profile.status === 'failed') dispatch("logout");
            else {
                commit("setProfile", profile);
                if (router.currentRoute.path === "/login") router.push("/");
            }
        },
        async logout({commit}) {
            await auth.signOut();
            await get("/api/auth/logout");
            this.cache.clear();
            commit("setProfile", undefined);
            commit("setUser", undefined);
            router.push('/login');
        },
        getUsers: () => get("/api/users").then(res => res.json()),
        getRoles: () => get("/api/roles").then(res => res.json()),
        getCollections: () => get("/api/collections").then(res => res.json()),
        getUser: (_, uid: string) => get(`/api/users/${uid}`).then(res => res.json()),
        getCollection: (_, cid: string) => get(`/api/collections/${cid}`).then(res => res.json()),
        getCollectionNotes: (_, cid: string) => get(`/api/collections/${cid}/notes`).then(res => res.json()),
        getCollectionRoles: (_, cid: string) => get(`/api/collections/${cid}/roles`).then(res => res.json()),
        getCollectionImages: (_, cid: string) => get(`/api/collections/${cid}/img`).then(res => res.json()),
    },
    modules: {},
    plugins: [vuexLocal.plugin, createCache({timeout: 60 * 60 * 1000})]
})
