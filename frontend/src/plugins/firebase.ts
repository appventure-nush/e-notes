import {initializeApp} from "firebase/app"
import {getAuth} from "firebase/auth";

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
export const auth = getAuth(app);