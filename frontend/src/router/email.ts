import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: []
});
router.beforeEach((to, from, next) => {
    if (!to.query.mode) return location.href = "/";
    else return next();
});
export default router
