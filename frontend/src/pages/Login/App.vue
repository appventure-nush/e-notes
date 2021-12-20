<template>
  <v-app>
    <v-container>
      <v-card max-width="699px" class="ma-auto" :loading="attempting" :disabled="attempting">
        <v-card-title>
          Login
          <v-btn small icon @click="toggleDark" class="ml-3">
            <v-icon v-text="$store.state.config.dark?'mdi-white-balance-sunny':'mdi-moon-waxing-crescent'"></v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row
              class="my-2"
              align="center"
              justify="space-around">
            <v-col>
              <v-btn
                  @click="microsoft"
                  outlined
                  color="primary">
                <v-icon left>
                  mdi-microsoft
                </v-icon>
                Login with Microsoft
              </v-btn>
            </v-col>
          </v-row>
          <v-divider/>
          <v-form
              ref="form"
              v-model="valid">
            <v-alert
                v-if="errorMsg"
                elevation="5"
                type="error"
            >{{ errorMsg }}
            </v-alert>
            <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
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
                color="primary"
                class="mr-4"
                @click="login">
              Login
            </v-btn>
            <v-btn
                :disabled="now<nextAllowed"
                text
                class="mr-4"
                @click="sendEmail">
              Reset Password
              <v-chip
                  class="mx-1"
                  small
                  v-if="now<nextAllowed"
                  v-text='Math.floor((nextAllowed-now) / 1000) + "s"'>
              </v-chip>
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
  </v-app>
</template>
<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  OAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail
} from "@firebase/auth";
import {auth} from "@/plugins/firebase";
import Config from "@/store/config"
import {verifyToken} from "@/mixins/api";

const provider = new OAuthProvider('microsoft.com');
provider.setCustomParameters({prompt: 'consent'});
@Component
export default class Login extends Vue {
  name = "Login";
  valid = true;
  show = false;

  nextAllowed = 0;
  now = 0;

  attempting = false;

  errorMsg? = '';

  @Watch('errorMsg')
  onErrorMsgChange() {
    this.valid = false;
  }

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

  toggleDark(): boolean {
    Config.setDark(!Config.settings.dark);
    return this.$vuetify.theme.dark = Boolean(Config.settings.dark);
  }

  login(): void {
    this.attempting = true;
    this.errorMsg = undefined;
    signInWithEmailAndPassword(auth, this.email, this.password)
        .then(firebaseData => firebaseData.user?.getIdToken(true))
        .then(token => verifyToken(token))
        .then(() => Config.fetchProfile())
        .then(() => this.postLogin())
        .catch(e => {
          this.attempting = false;
          this.errorMsg = e.code;
        });
  }

  microsoft() {
    this.errorMsg = undefined;
    this.attempting = true;
    return signInWithPopup(auth, provider).then(result => {
      const credential = OAuthProvider.credentialFromResult(result);
      if (!(credential && credential.idToken)) throw "Credential is null";
      return result.user.getIdToken(true);
    })
        .then(token => verifyToken(token))
        .then(() => Config.fetchProfile())
        .then(() => this.postLogin())
        .catch(error => {
          this.attempting = false;
          console.log(error);
          if (error.code === 'auth/account-exists-with-different-credential') {
            fetchSignInMethodsForEmail(auth, error.customData.email).then(methods => {
              this.errorMsg = methods[0] !== 'password' ?
                  "Another account of same email already exists" :
                  "Email/password account already exist, please reset password. And link microsoft account in profile after login";
            });
          } else this.errorMsg = error.code;
        });
  }

  postLogin() {
    if (auth.currentUser) {
      window.location.href = "/";
    }
  }

  sendEmail(): void {
    if (!this.valid) return;
    this.now = Date.now();
    this.nextAllowed = Date.now() + 60 * 1000;
    this.updateEmail();
    sendPasswordResetEmail(auth, this.email);
  }

  updateEmail() {
    this.now = Date.now();
    if (this.now < this.nextAllowed) requestAnimationFrame(this.updateEmail);
  }
}
</script>