import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './mixins'
import './plugins/others'
import vuetify from './plugins/vuetify'
import {initializeAuth, browserLocalPersistence, browserPopupRedirectResolver} from "@firebase/auth";
import {initializeApp} from "@firebase/app";

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

Vue.config.productionTip = false
export const app = initializeApp({
    apiKey: "AIzaSyARHcPTpQ09ekeN91DtgfrAl8kA3bgrcYM",
    authDomain: "e-notes-nush.firebaseapp.com",
    databaseURL: "https://e-notes-nush.firebaseio.com",
    projectId: "e-notes-nush",
    storageBucket: "e-notes-nush.appspot.com",
    messagingSenderId: "1002111194265",
    appId: "1:1002111194265:web:24a8837e5d910ebcd11408",
    measurementId: "G-5CEEWG9PZR"
});
export const auth = initializeAuth(app, {
    persistence: [browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
});

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