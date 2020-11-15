import Vue from 'vue'
import Vuex from 'vuex'
import User from "@/types/user";
import router from '../plugins/router';
import {auth, usersCollection} from "@/firebase";

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: {}
  } as {
    user: User | null
  },
  mutations: {
    setUserProfile(state, val) {
      state.user = val
    }
  },
  actions: {
    async login({dispatch}, form) {
      const {user} = await auth.signInWithEmailAndPassword(form.email, form.password)
      dispatch('fetchUserProfile', user)
    },
    async fetchUserProfile({commit}, user) {
      const userProfile = await usersCollection.doc(user.uid).get()
      commit('setUserProfile', userProfile.data())
      await router.push('/')
    }
  }
});

export default store;
