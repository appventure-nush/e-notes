<template>
  <v-container id="login">
    <v-form justify-center>
      <h1>NUSH Notes</h1>
      <div class="section">
        <label for="email">Email</label>
        <input v-model.trim="email" type="email" placeholder="hxxxxxxx@nushigh.edu.sg" id="email"/>
      </div>
      <div class="section">
        <label for="password1">Password</label>
        <input v-model.trim="password" type="password" placeholder="******" id="password1"/>
      </div>
      <div class="section">
        <button class="button" v-on:click="login">Login</button>
        <button class="button" v-on:click="microsoft">with Microsoft</button>
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

const provider = new firebase.auth.OAuthProvider("microsoft.com");

export default Vue.extend({
  name: "SignIn",
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
    login() {
      this.$store.dispatch("login", {
        email: this.email,
        password: this.password
      })
    },
    microsoft() {
      firebase.auth().signInWithPopup(provider);
    }
  }
});

</script>
