<template>
  <v-container fluid>
    hi
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Dashboard from "./Dashboard.vue"

export default Vue.extend({
  name: "Main",
  data: () => ({
    studentSignIn: false,
    adminSignIn: false
  }),
  components: {
    Dashboard: Dashboard
  }
});
</script>
