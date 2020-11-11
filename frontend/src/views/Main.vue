<template>
  <v-container fluid>
    hi
    <Login></Login>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
// import Dashboard from "./Dashboard.vue"
import Login from "./Login.vue"

export default Vue.extend({
  name: "Main",
  data: () => ({
    studentSignIn: false,
    adminSignIn: false
  }),
  components: {
    // Dashboard: Dashboard,
    Login: Login
  }
});
</script>
