import Vue from 'vue'
import Vuex from 'vuex'
import createCache from 'vuex-cache';
import VuexPersistence from 'vuex-persist';

Vue.use(Vuex)
const vuexLocal = new VuexPersistence({storage: window.localStorage})

const store = new Vuex.Store({
    plugins: [vuexLocal.plugin, createCache({timeout: 60 * 60 * 1000})]
});

export default store;
