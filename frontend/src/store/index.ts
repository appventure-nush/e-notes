import Vue from 'vue'
import Vuex from 'vuex'
import {auth} from "@/main";
import router from "@/router";
import firebase from "firebase/compat";
import {State} from "@/shims-vuex";
import {get} from "@/api/api";
import {User} from "@/types/user";
import VuexPersistence from 'vuex-persist';
import {Collection} from "@/types/coll";
import {Note} from "@/types/note";
import {Role} from "@/types/role";

Vue.use(Vuex)
const vuexLocal = new VuexPersistence<State>({
    storage: window.localStorage
})

export default new Vuex.Store<State>({
    state: {
        dark: false,
        user: <firebase.User>{},
        profile: <User>{},
        currentNotes: [],
        currentRoles: [],
        collections: [],

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
        setProfile(state, user?: User) {
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

        collections(state, collections: Collection[]) {
            state.collections = collections;
        }
    },
    actions: {
        async fetchUserProfile({commit}, payload: firebase.User) {
            commit("setUser", payload);
            commit("setProfile", await get("/api/auth").then(res => res.json()));
            if (router.currentRoute.path === "/login") await router.push("/");
        },
        async logout({commit}) {
            await auth.signOut();
            await get("/api/auth/logout");
            commit("setProfile", undefined);
            commit("setUser", undefined);
            await router.push('/login');
        },
        toggleDark({commit}) {
            commit('toggleDark');
        }
    },
    modules: {},
    plugins: [vuexLocal.plugin]
})
