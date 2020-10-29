import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./plugins/router";
import store from "@/plugins/vuex";

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  store,
  render(h) { return h(App); },
}).$mount("#app");
