import Vue from 'vue'
import VueRouter, {RouteConfig, Route} from 'vue-router'
import {auth, FIREBASE_INITIALIZED} from "@/main";
import store from "@/store";

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
            title: "Home",
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
            title: "Users",
            public: true,
            auth: true
        },
        children: [
            {
                meta: {
                    title: "{{uid}}"
                },
                props: true,
                name: "User",
                path: ':uid',
                component: () => import(/* webpackChunkName: "user" */'@/views/User.vue')
            }
        ]
    },
    {
        path: '/roles',
        name: 'Roles',
        component: () => import(/* webpackChunkName: "roles" */"@/views/Roles.vue"),
        meta: {
            icon: "mdi-tag-multiple",
            title: "Roles",
            public: true,
            auth: true
        },
        children: [
            {
                meta: {
                    title: "{{rid}}"
                },
                props: true,
                name: "Role",
                path: ':rid',
                component: () => import(/* webpackChunkName: "role" */'@/views/RoleViewer.vue')
            }
        ]
    },
    {
        name: "Collections",
        path: '/collection/:cid',
        components: {
            default: () => import(/* webpackChunkName: "collection" */'@/views/CollectionViewer.vue'),
            appbar: () => import(/* webpackChunkName: "collection.appbar" */'@/components/CollectionAppbar.vue')
        },
        meta: {
            title: "{{cid}}",
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
                name: "Collection",
                path: '',
                component: () => import(/* webpackChunkName: "collection.info" */'@/components/CollectionInfo.vue'),
                beforeEnter(to, from, next) {
                    store.commit('setCurrentNote', undefined);
                    next();
                }
            },
            {
                props: true,
                name: "NoteContents",
                path: ':nid/index.html',
                redirect: to => ({
                    name: "Collection",
                    params: {cid: to.params.cid}
                })
            },
            {
                props: true,
                name: "Note",
                path: ':nid/view',
                meta: {
                    title: "{{cid}}/{{nid}}",
                    hideTitle: true
                },
                component: () => import(/* webpackChunkName: "note" */'@/views/NoteViewer.vue')
            },
            {
                props: true,
                name: "Edit Note",
                path: ':nid/edit',
                meta: {
                    title: "Edit {{nid}}",
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
            },
            {
                path: '*',
                redirect: to => ({
                    name: "Collection Info",
                    params: {cid: to.params.cid}
                })
            }
        ]
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import(/* webpackChunkName: "profile" */'@/views/Profile.vue'),
        meta: {
            title: "Profile",
            auth: true
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import(/* webpackChunkName: "login" */'@/views/Login.vue'),
        meta: {
            title: "Login",
            naked: true
        }
    },
    {
        path: "/rick",
        name: "rick",
        beforeEnter() {
            window.location.href = "https://youtu.be/dQw4w9WgXcQ";
        }
    },
    {
        path: "*",
        name: "404",
        component: () => import(/* webpackChunkName: "404" */"@/views/PageNotFound.vue"),
        meta: {title: '404 Not Found', naked: true}
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export async function shouldAllow(to: Route): Promise<boolean> {
    if (to.matched.some(record => record.meta.auth)) {
        const user = auth.currentUser;
        if (user == null) return false;
        else if (to.matched.some(record => record.meta.admin)) return user.getIdTokenResult().then(res => !!res.claims.admin);
        else return true;
    } else return true;
}

const DEFAULT_TITLE = 'Enotes';
router.afterEach(to => Vue.nextTick(() => {
    let title = to.meta?.title || DEFAULT_TITLE;
    title = title.replace(/{{uid}}/g, to.params.uid);
    title = title.replace(/{{rid}}/g, to.params.rid);
    title = title.replace(/{{nid}}/g, to.params.nid);
    title = title.replace(/{{cid}}/g, to.params.cid);
    document.title = title;
    if (FIREBASE_INITIALIZED) shouldAllow(to).then(yes => yes ? null : router.push('/login'));
}));
export default router
