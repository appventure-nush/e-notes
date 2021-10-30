<template>
  <v-container>
    <v-form
        ref="form"
        v-model="valid"
        lazy-validation>

      <v-text-field
          v-model="email"
          :rules="emailRules"
          label="E-mail"
          required
      ></v-text-field>

      <v-text-field
          v-model="password"
          :rules="passwordRules"
          label="Password"
          :type="show ? 'text' : 'password'"
          :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="show = !show"
          required
      ></v-text-field>
      <v-btn
          :disabled="attempting"
          color="success"
          class="mr-4"
          @click="login"
      >
        Login
      </v-btn>
      <v-btn
          :disabled="now<nextAllowed"
          class="mr-4"
          @click="sendEmail"
      >
        Reset Password
        <v-chip
            v-if="now<nextAllowed"
            v-text='Math.floor((nextAllowed-now) / 1000) + "s"'>
        </v-chip>
      </v-btn>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {auth} from "@/main";

@Component
export default class Login extends Vue {
  name = "Login";
  valid = true;
  show = false;

  nextAllowed = 0;
  now = 0;

  attempting = false;

  errorMsg = '';
  email = '';
  emailRules = [
    (v: string) => !!v || 'E-mail is required',
    (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    () => !this.errorMsg || this.errorMsg
  ];
  password = '';
  passwordRules = [
    (v: string) => !!v || 'Password is required',
    () => !this.errorMsg || this.errorMsg
  ];

  login() {
    if (!this.valid) return;
    this.attempting = true;
    this.$store.dispatch('login', {
      email: this.email,
      password: this.password,
    }).catch(e => {
      console.log(JSON.stringify(e));
      this.errorMsg = e.code;
    }).finally(() => this.attempting = false);
  }

  sendEmail() {
    if (!this.valid) return;
    this.now = Date.now();
    this.nextAllowed = Date.now() + 60 * 1000;
    let int = setInterval(() => {
      this.now = Date.now();
      if (this.now > this.nextAllowed) clearInterval(int);
    }, 16);
    auth.sendPasswordResetEmail(this.email).then(res => {
      console.log(res);
    })
  }
}
</script>

<style scoped>

</style>