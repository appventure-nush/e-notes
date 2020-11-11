<template>
  <v-container fluid>
    <SignIn v-if="adminSignIn === false && studentSignIn === false"></SignIn>
    <Student v-if="studentSignIn"></Student>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Student from "./Student.vue"
import SignIn from "./SignIn.vue"

export default Vue.extend({
  name: "Main",
  data: () => ({
    studentSignIn: false,
    adminSignIn: false
  }),
  components: {
    Student: Student,
    SignIn: SignIn
  }
});
</script>
