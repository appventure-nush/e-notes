import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist';

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
    storage: window.localStorage, restoreState: (key, storage) => {
        try {
            return JSON.parse(storage?.getItem(key) || "{}");
        } catch (e) {
            return {};
        }
    }
})

const store = new Vuex.Store({
    plugins: [vuexLocal.plugin]
});

export default store;
