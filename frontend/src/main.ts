import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './mixins'
import './plugins/others'
import vuetify from './plugins/vuetify'
import {auth} from "@/plugins/firebase";

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

const unsubscribe = auth.onAuthStateChanged(user => {
    FIREBASE_INITIALIZED = true;
    store.commit('setUser', user);
    store.dispatch('fetchUserProfile');
    unsubscribe();
});

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app');
console.log(ASCII_NAME, "font-family:monospace");