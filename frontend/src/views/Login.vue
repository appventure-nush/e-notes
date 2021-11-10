<template>
  <v-container>
    <v-card max-width="699px" class="ma-auto" :loading="attempting" :disabled="attempting">
      <v-card-title>
        Login
        <v-btn small icon @click="toggleDark" class="ml-3">
          <v-icon v-text="$store.state.dark?'mdi-white-balance-sunny':'mdi-moon-waxing-crescent'"></v-icon>
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
              color="success"
              class="mr-4"
              @click="login"
          >
            Login
          </v-btn>
          <v-btn
              :disabled="now<nextAllowed"
              text
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
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import {auth} from "@/main";
import {post} from "@/mixins/api";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  OAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail
} from "firebase/auth";

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
    this.$store.commit('toggleDark');
    return this.$vuetify.theme.dark = this.$store.state.dark;
  }

  login(): void {
    this.attempting = true;
    this.errorMsg = undefined;
    signInWithEmailAndPassword(auth, this.email, this.password)
        .then(firebaseData => firebaseData.user?.getIdToken(true))
        .then(token => this.verifyToken(token))
        .catch(e => {
          this.attempting = false;
          console.log(this.errorMsg = e.code);
        });
  }

  microsoft(): Promise<void> {
    this.errorMsg = undefined;
    this.attempting = true;
    return signInWithPopup(auth, provider).then(result => {
      console.log("oath return", result.user.email);
      const credential = OAuthProvider.credentialFromResult(result);
      if (!(credential && credential.idToken)) throw "Credential is null";
      return result.user.getIdToken(true);
    }).then(token => this.verifyToken(token)).catch(error => {
      this.attempting = false;
      if (error.code === 'auth/account-exists-with-different-credential') {
        fetchSignInMethodsForEmail(auth, error.customData.email).then(methods => {
          this.errorMsg = methods[0] !== 'password' ?
              "Another account of same email already exists" :
              "Email/password account already exist, please reset password. And link microsoft account in profile after login";
        });
      } else this.errorMsg = error.code;
    });
  }

  verifyToken(token: string): Promise<void> {
    return post("/api/auth", {token: token}).then(res => res.json()).then(res => {
      if (res.status === "success") this.$store.dispatch("fetchUserProfile");
      else throw res.reason;
    });
  }

  sendEmail(): void {
    if (!this.valid) return;
    this.now = Date.now();
    this.nextAllowed = Date.now() + 60 * 1000;
    let int = setInterval(() => {
      this.now = Date.now();
      if (this.now > this.nextAllowed) clearInterval(int);
    }, 16);
    sendPasswordResetEmail(auth, this.email).then(res => console.log(res))
  }
}
</script>

<style scoped>

</style>