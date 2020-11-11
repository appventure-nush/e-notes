<template>
  <v-container fluid>
    <div style="width: 25%; margin: auto;">
      <v-card class="text-center">
        <p style="padding-top: 20px; font-size: 25px;">Welcome to e-notes</p>
        <img src="../../public/img/logo.png" style="max-width:100%; height: auto; padding: 0px 10px">
        <button style="margin-top: 20px; margin-bottom: 20px; font-size: 20px; background-color: deepskyblue; border-radius: 5px">Sign In</button>
      </v-card>
    </div>
  </v-container>
</template>
<script lang="ts">
import Vue from "vue";
import firebase from "firebase/app";
import "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARHcPTpQ09ekeN91DtgfrAl8kA3bgrcYM",
  authDomain: "e-notes-nush.firebaseapp.com",
  databaseURL: "https://e-notes-nush.firebaseio.com",
  projectId: "e-notes-nush",
  storageBucket: "e-notes-nush.appspot.com",
  messagingSenderId: "1002111194265",
  appId: "1:1002111194265:web:24a8837e5d910ebcd11408",
  measurementId: "G-5CEEWG9PZR"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var provider = new firebase.auth.OAuthProvider('microsoft.com');


export default Vue.extend({
  name: "SignIn",
  computed: {
    SignInWithRedirect(): void {
      firebase.auth().signInWithPopup(provider)
        .then(function(result) {
          console.log("signed in");
        })
        .catch(function(error) {
          console.log(error)
        });
    }
  }
});

</script>
