import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import Home from '../views/Home.vue'
import HomeAppbar from '../components/HomeAppbar.vue'
import firebase from "firebase/compat";
import PageNotFound from "@/views/PageNotFound.vue";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        components: {
            default: Home,
            appbar: HomeAppbar
        },
        meta: {
            icon: "mdi-view-dashboard",
            public: true,
            auth: true,
            exact: true
        }
    },
    {
        path: '/users',
        name: 'Users',
        component: () => import("@/views/Users.vue"),
        meta: {
            icon: "mdi-account-multiple",
            public: true,
            auth: true
        },
        children: [
            {
                props: true,
                name: "User",
                path: ':uid',
                component: () => import('@/views/User.vue')
            }
        ]
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: {
            auth: true
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: {
            naked: true
        }
    },
    {
        path: '/collection/:cid',
        name: 'Collection',
        components: {
            default: () => import('@/views/Collection.vue'),
            appbar: () => import('@/components/CollectionAppbar.vue')
        },
        meta: {
            hideTitle: true,
            auth: true
        },
        props: {
            default: true,
            appbar: true
        },
        children: [
            {
                props: true,
                name: "Note",
                path: ':nid/view',
                meta: {
                    hideTitle: true
                },
                component: () => import('@/views/Note.vue')
            },
            {
                props: true,
                name: "Note Redirect",
                path: ':nid',
                redirect: to => ({
                    name: "Note",
                    path: `/collections/${to.params.cid}/notes/${to.params.nid}/view`
                }),
            }
        ]
    },
    {path: "*", name: "404", component: PageNotFound, meta: {auth: true}}
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
                name: "Login",
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
