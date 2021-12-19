<template>
  <v-app>
    <v-container fill-height>
      <v-row align="center"
             justify="center">
        <v-col cols="12" sm="9" md="7" lg="6">
          <v-card :loading="!actionReady&&!this.actionError" :disabled="actionStarted&&!actionFinished">
            <v-form @submit.prevent="submit">
              <v-card-title v-text="title"></v-card-title>
              <v-alert color="error" class="ma-2" outlined dismissible v-if="actionError">
                <strong class="mx-2">Error</strong>
                <span v-html="actionError"></span>
              </v-alert>
              <v-alert color="success" class="ma-2" outlined dismissible v-if="actionResult">
                <strong class="mx-2">Done</strong>
                <span v-html="actionResult"></span>
              </v-alert>
              <v-card-text>
                <v-text-field v-if="showEmail" label="Email" :value="accountEmail" hide-details="auto"
                              disabled></v-text-field>
                <v-text-field v-if="showPassword" label="Password" v-model="password" type="password"
                              hide-details="auto"></v-text-field>
              </v-card-text>
              <v-card-actions class="ml-1" v-if="showForm">
                <v-btn color="success" v-if="actionFinished" :href="continueUrl||'/'">Back</v-btn>
                <v-btn type="submit" color="primary" v-else>
                  {{ mode === 'recoverEmail' ? 'Reset Password' : 'Submit' }}
                </v-btn>
                <v-btn text to="/">Cancel</v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>
<script lang="ts">
import {auth, FirebaseError} from "@/plugins/firebase";
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  verifyPasswordResetCode
} from "firebase/auth";
import {Component, Vue} from "vue-property-decorator";

@Component
export default class EmailLanding extends Vue {
  name = "EmailLanding";

  title = "";
  actionReady = false;
  actionFinished = false;
  actionStarted = false;
  actionError = "";
  actionResult = "";

  showEmail = false;
  showPassword = false;
  showForm = false;

  password = "";

  accountEmail = "";

  created() {
    if (!(this.mode && this.actionCode)) return history.back();
    switch (this.mode) {
      case 'resetPassword':
        this.title = "Reset Password"
        this.showEmail = this.showPassword = this.showForm = true;
        this.handleResetPassword();
        break;
      case 'recoverEmail':
        this.title = "Recover Email"
        this.showEmail = this.showForm = true;
        this.handleRecoverEmail();
        break;
      case 'verifyEmail':
        this.title = "Verify Email"
        this.handleVerifyEmail();
        break;
      default:
        this.title = "𝓔𝓻𝓻𝓸𝓻"
        this.actionError = "Did you really arrive here via a provided link?";
    }
  }

  submit() {
    this.actionStarted = true;
    this.actionError = this.actionResult = "";
    switch (this.mode) {
      case 'resetPassword':
        confirmPasswordReset(auth, this.actionCode, this.password).then(() => {
          this.actionResult = "Your password has been reset!"
          signInWithEmailAndPassword(auth, this.accountEmail, this.password);
        }).catch((error: FirebaseError) => this.actionError = error.code).finally(() => this.actionFinished = true);
        break;
      case 'recoverEmail':
        sendPasswordResetEmail(auth, this.accountEmail).then(() => {
          this.actionResult = "Password reset link has been sent to your email"
        }).catch((error: FirebaseError) => this.actionError = error.code).finally(() => this.actionFinished = true);
        break;
      default:
        this.actionError = "How did you submit this form?";
    }
  }

  handleResetPassword() {
    verifyPasswordResetCode(auth, this.actionCode).then((email) => {
      this.accountEmail = email;
      this.actionReady = true;
    }).catch((error: FirebaseError) => this.actionError = error.code);
  }

  handleRecoverEmail() {
    checkActionCode(auth, this.actionCode).then((info) => {
      this.accountEmail = info['data']['email'] as string;
      return applyActionCode(auth, this.actionCode);
    }).then(() => {
      this.actionReady = true;
      this.actionResult = `Your email has been recovered to <b>${this.accountEmail}</b>`
    }).catch((error: FirebaseError) => this.actionError = error.code);
  }

  handleVerifyEmail() {
    applyActionCode(auth, this.actionCode).then(() => {
      this.actionReady = true;
      this.actionFinished = true;
      this.actionResult = "Your email has been verified!";
    }).catch((error: FirebaseError) => this.actionError = error.code);
  }

  get mode() {
    return this.$route.query.mode as string;
  }

  get lang() {
    return this.$route.query.lang as string || 'en';
  }

  get actionCode() {
    return this.$route.query.oobCode as string;
  }

  get continueUrl() {
    return this.$route.query.continueUrl as string;
  }
}
</script>