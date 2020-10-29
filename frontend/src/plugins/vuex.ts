import Vue from 'vue'
import Vuex from 'vuex'
import User from "@/types/user";

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: null
  } as {
    user: User | null
  },
});

export default store;
