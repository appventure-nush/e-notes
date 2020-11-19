<template>
  <v-container id="login">
    <v-form justify-center>
      <h1>NUSH Notes</h1>
      <div class="section">
        <label for="email">Email</label>
        <input v-model="email" type="email" placeholder="hxxxxxxx@nushigh.edu.sg" id="email"/>
      </div>
      <div class="section">
        <label for="password1">Password</label>
        <input v-model="password" type="password" placeholder="******" id="password1"/>
      </div>
      <div class="section">
        <button class="button" v-on:click="login">Login</button>
        <button class="button" v-on:click="microsoft">Continue with Microsoft</button>
      </div>
    </v-form>
  </v-container>
</template>
<style scoped>
#login {
  padding: 10px;
}

label {
  display: block;
}

button {
  border: solid 1px black;
  border-radius: 5px;
  padding: 3px;
  margin: 3px;
}

input {
  padding: 3px;
  border: solid 1px blue;
  border-radius: 5px;
  margin: 3px;
  width: 80%;
}
</style>
<script lang="ts">
import Vue from "vue";
import {firebase, auth} from "../firebase";
import Profile from "./Profile.vue"

const provider = new firebase.auth.OAuthProvider("microsoft.com");

export default Vue.extend({
  name: "SignIn",
  components: {
    Profile: Profile
  },
  computed: {},
  data: () => ({
    email: "", password: ""
  }),
  mounted() {
    auth.onAuthStateChanged(user => {
      if (user) this.$router.push("/");
    })
  },
  methods: {
    login: function () {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password).catch(function (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === "auth/wrong-password") alert("Wrong password.");
        else alert(errorMessage);
        console.log(error);
      });
    },
    microsoft: function () {
      firebase.auth().signInWithPopup(provider);
    }
  }
});

</script>
