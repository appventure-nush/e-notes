import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

Vue.config.productionTip = false
firebase.initializeApp({
    apiKey: "AIzaSyARHcPTpQ09ekeN91DtgfrAl8kA3bgrcYM",
    authDomain: "e-notes-nush.firebaseapp.com",
    databaseURL: "https://e-notes-nush.firebaseio.com",
    projectId: "e-notes-nush",
    storageBucket: "e-notes-nush.appspot.com",
    messagingSenderId: "1002111194265",
    appId: "1:1002111194265:web:24a8837e5d910ebcd11408",
    measurementId: "G-5CEEWG9PZR"
});
export const auth = firebase.auth();
const unsubscribe = auth.onAuthStateChanged(user => {
    new Vue({
        router,
        store,
        vuetify,
        render: h => h(App),
        created: function () {
            if (user) return store.dispatch('fetchUserProfile', user);
        },
    }).$mount('#app');
    unsubscribe();
});