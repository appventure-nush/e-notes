import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {auth} from "@/plugins/firebase";
import {onAuthStateChanged} from "@firebase/auth";
import './mixins'
import './plugins/others'

import Config from "@/store/config"
import vuetify from './plugins/vuetify'

const ASCII_NAME =
    `%c  _____             _              _   _ _   _ ____  _   _ \n` +
    " | ____|_ __   ___ | |_ ___  ___  | \\ | | | | / ___|| | | |\n" +
    " |  _| | '_ \\ / _ \\| __/ _ \\/ __| |  \\| | | | \\___ \\| |_| |\n" +
    " | |___| | | | (_) | ||  __/\\__ \\ | |\\  | |_| |___) |  _  |\n" +
    " |_____|_| |_|\\___/ \\__\\___||___/ |_| \\_|\\___/|____/|_| |_|\n\n" +
    " You can report an issue at https://github.com/appventure-nush/e-notes\n" +
    " Backend written by Zhao Yun\n" +
    " Frontend written by Zhao Yun\n" +
    " Hosted on Appventure Servers\n" +
    " Powered with express.js and vue.js";

Vue.config.productionTip = false;

export let FIREBASE_INITIALIZED = false;

const unsubscribe = onAuthStateChanged(auth, user => {
    FIREBASE_INITIALIZED = true;
    Config.setUser(user);
    Config.fetchProfile();
    if (user) {
        if (!user.emailVerified && router.currentRoute.name !== "Profile") router.push({
            name: "Profile",
            query: {askVerify: "true"}
        })
        else if (user.emailVerified && router.currentRoute.name === "Profile" && router.currentRoute.query.askVerify) router.push({
            name: "Profile"
        })
    }
    unsubscribe();
});

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app');

console.log(ASCII_NAME, "font-family:monospace");