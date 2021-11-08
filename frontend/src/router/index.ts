import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import {auth} from "@/main";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        components: {
            default: () => import(/* webpackChunkName: "home" */"@/views/Home.vue"),
            appbar: () => import(/* webpackChunkName: "home.app" */"@/components/HomeAppbar.vue")
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
        component: () => import(/* webpackChunkName: "users" */"@/views/Users.vue"),
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
                component: () => import(/* webpackChunkName: "user" */'@/views/User.vue')
            }
        ]
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import(/* webpackChunkName: "profile" */'@/views/Profile.vue'),
        meta: {
            auth: true
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import(/* webpackChunkName: "login" */'@/views/Login.vue'),
        meta: {
            naked: true
        }
    },
    {
        path: '/collection/:cid',
        name: 'Collection',
        components: {
            default: () => import(/* webpackChunkName: "collection" */'@/views/CollectionViewer.vue'),
            appbar: () => import(/* webpackChunkName: "cAppbar" */'@/components/CollectionAppbar.vue')
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
                component: () => import(/* webpackChunkName: "note" */'@/views/NoteViewer.vue')
            },
            {
                props: true,
                name: "Edit Note",
                path: ':nid/edit',
                meta: {
                    hideTitle: true
                },
                component: () => import(/* webpackChunkName: "note.edit" */'@/views/NoteEditor.vue')
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
    {
        path: "*",
        name: "404",
        component: () => import(/* webpackChunkName: "404" */"@/views/PageNotFound.vue"),
        meta: {auth: true}
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.auth)) {
        const user = auth.currentUser;
        if (user == null) next({
            name: "Login",
            params: {to: to.fullPath}
        }); else if (to.matched.some(record => record.meta.admin)) user.getIdTokenResult().then(res => {
            if (res.claims.admin) next();
            else next({path: '/'})
        }); else next()
    } else next()
})
export default router
