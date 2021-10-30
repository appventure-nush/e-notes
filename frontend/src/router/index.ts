import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import Home from '../views/Home.vue'
import firebase from "firebase/compat";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            auth: true
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: {
            naked: true
        }
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.auth)) {
        const user = firebase.auth().currentUser;
        if (user == null) {
            next({
                path: '/login',
                params: {to: to.fullPath}
            })
        } else {
            if (to.matched.some(record => record.meta.admin)) {
                user.getIdTokenResult().then(res => {
                    if (res.claims.admin) next();
                    else next({path: '/'})
                });
            } else {
                next()
            }
        }
    } else {
        next()
    }
})
export default router
