import Vue from 'vue'
import Vuex from 'vuex'
import {auth} from "@/main";
import router from "@/router";
import firebase from "firebase/compat";
import {State} from "@/shims-vuex";
import {get, post} from "@/api/api";
import {User} from "@/types/user";
import VuexPersistence from 'vuex-persist';

Vue.use(Vuex)
const vuexLocal = new VuexPersistence<State>({
    storage: window.localStorage
})

export default new Vuex.Store<State>({
    state: {
        user: undefined,
        profile: undefined,
    },
    mutations: {
        setUser(state, user?: firebase.User) {
            state.user = user;
        },
        setProfile(state, user?: User) {
            state.profile = user;
        }
    },
    actions: {
        async verifyLogin({commit, dispatch}, payload: firebase.User) {
            commit("setUser", payload);
            const token = await payload.getIdToken(true);
            const res = await post("/api/auth", {
                token: token
            }).then(res => res.json());
            if (res.status === "success") {
                dispatch("fetchUserProfile");
            } else {
                throw res.reason;
            }
        },
        async fetchUserProfile({commit}) {
            commit("setProfile", await get("/api/auth").then(res => res.json()));
            if (router.currentRoute.path === "/login") await router.push("/");
        },
        login({commit, dispatch}, payload) {
            return auth.signInWithEmailAndPassword(payload.email, payload.password)
                .then(firebaseData => dispatch('verifyLogin', firebaseData.user))
        },
        async logout({commit}) {
            await auth.signOut();
            await get("/api/auth/logout");
            commit("setProfile", undefined);
            commit("setUser", undefined);
            await router.push('/login');
        }
    },
    modules: {},
    plugins: [vuexLocal.plugin]
})
