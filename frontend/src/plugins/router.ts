import Vue from "vue";
import VueRouter, {RouteConfig} from "vue-router";
import Main from "@/views/Main.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    component: Main,
  }
];

export default new VueRouter({
  routes,
});
