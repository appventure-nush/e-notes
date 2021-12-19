// Login/main.ts
import Vue from 'vue'
import App from './App.vue'
import store from '@/store'
import {auth} from "@/plugins/firebase";
import {onAuthStateChanged} from "@firebase/auth";
import router from '@/router/login'
import '@/mixins'
import '@/plugins/others'

import Config from "@/store/config"
import vuetify from '@/plugins/vuetify'

Vue.config.productionTip = false;

export let FIREBASE_INITIALIZED = false;
onAuthStateChanged(auth, user => {
    FIREBASE_INITIALIZED = true;
    Config.setUser(user);
});
new Vue({
    store,
    router,
    vuetify,
    render: h => h(App)
}).$mount('#app');