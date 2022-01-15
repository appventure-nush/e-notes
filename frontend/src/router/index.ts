import Vue from 'vue'
import VueRouter, {Route, RouteConfig} from 'vue-router'
import {FIREBASE_INITIALIZED} from "@/pages/Index/main";
import Config from "@/store/config";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        components: {
            default: () => import(/* webpackChunkName: "home" */"@/views/Home.vue"),
            appbar: () => import(/* webpackChunkName: "home.app" */"@/components/appbar/HomeAppbar.vue")
        },
        meta: {
            icon: "mdi-view-dashboard",
            title: "Home",
            public: true,
            exact: true
        }
    },
    {
        path: '/users',
        component: () => import(/* webpackChunkName: "users" */"@/views/Users.vue"),
        meta: {
            icon: "mdi-account-multiple",
            title: "Users",
            public: true
        },
        children: [
            {
                name: "Users",
                path: '',
                component: () => import(/* webpackChunkName: "user-listing" */'@/components/viewer/UsersViewer.vue')
            },
            {
                meta: {
                    hideFooter: true,
                    title: "{{uid}}"
                },
                props: true,
                name: "User",
                path: ':uid',
                component: () => import(/* webpackChunkName: "user" */'@/components/viewer/UserViewer.vue')
            }
        ]
    },
    {
        path: '/roles',
        name: 'Roles',
        components: {
            default: () => import(/* webpackChunkName: "roles" */"@/views/Roles.vue"),
            appbar: () => import(/* webpackChunkName: "roles.appbar" */'@/components/appbar/RoleAppbar.vue')
        }, props: {
            default: true,
            appbar: true
        },
        meta: {
            hideFooter: true,
            icon: "mdi-tag-multiple",
            title: "Roles",
            public: true,
            admin: true
        },
        children: [
            {
                meta: {
                    hideFooter: true,
                    title: "New"
                },
                props: true,
                name: "New Role",
                path: 'new',
                component: () => import(/* webpackChunkName: "role" */'@/components/viewer/RoleViewer.vue')
            },
            {
                meta: {
                    hideFooter: true,
                    title: "{{rid}}"
                },
                props: true,
                name: "Role",
                path: ':rid',
                component: () => import(/* webpackChunkName: "role" */'@/components/viewer/RoleViewer.vue')
            }
        ]
    },
    {
        path: '/collection/:cid',
        components: {
            default: () => import(/* webpackChunkName: "collection" */'@/components/viewer/CollectionViewer.vue'),
            appbar: () => import(/* webpackChunkName: "collection.appbar" */'@/components/appbar/CollectionAppbar.vue')
        }, props: {
            default: true,
            appbar: true
        },
        meta: {
            title: "{{cid}}",
            hideTitle: true
        },
        children: [
            {
                props: true,
                name: "Collection",
                path: '',
                component: () => import(/* webpackChunkName: "collection.info" */'@/components/CollectionInfo.vue')
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
                component: () => import(/* webpackChunkName: "note" */'@/components/viewer/NoteViewer.vue')
            },
            {
                props: true,
                name: "Note History",
                path: ':nid/:date',
                meta: {
                    title: "{{nid}}",
                    hideTitle: true
                },
                component: () => import(/* webpackChunkName: "note" */'@/components/viewer/NoteViewer.vue')
            },
            {
                props: true,
                name: "Edit Note",
                path: ':nid/edit',
                meta: {
                    hideFooter: true,
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
            title: "Profile"
        }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import(/* webpackChunkName: "settings" */'@/views/SettingsPage.vue'),
        meta: {
            title: "Settings"
        }
    },
    {
        path: '/admin',
        name: 'Config',
        component: () => import(/* webpackChunkName: "settings" */'@/views/Config.vue'),
        meta: {
            title: "Config",
            admin: true
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
        meta: {title: '404 Not Found'}
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export function shouldAllow(to: Route): boolean {
    return !((to.matched && to.matched.some(record => record.meta.admin) || to.meta?.admin) && !Config.profile?.admin);
}

const DEFAULT_TITLE = 'Enotes';
router.beforeEach((to, from, next) => {
    if (FIREBASE_INITIALIZED && !shouldAllow(to)) history.back();
    else next();
})
router.afterEach(to => Vue.nextTick(() => {
    let title = to.meta?.title || DEFAULT_TITLE;
    title = title.replace(/{{uid}}/g, to.params.uid);
    title = title.replace(/{{rid}}/g, to.params.rid);
    title = title.replace(/{{nid}}/g, to.params.nid);
    title = title.replace(/{{cid}}/g, to.params.cid);
    document.title = title;
}));
export default router
