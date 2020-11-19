import Vue from "vue";
import App from "./App.vue";

import vuetify from "@/plugins/vuetify";
import router from "./plugins/router";
import store from "@/plugins/vuex";
import {auth} from '@/firebase'

Vue.config.productionTip = false;

let app: Vue;
auth.onAuthStateChanged(user => {
  if (!app) app = new Vue({
    vuetify,
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
  if (user) user.getIdToken(true).then(idToken => localStorage.jwt = idToken).catch(console.error);
  else localStorage.jwt = undefined;
});
