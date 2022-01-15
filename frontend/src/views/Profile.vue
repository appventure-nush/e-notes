<template>
  <v-container>
    <v-card :loading="saving" :disabled="saving" :outlined="editing" v-if="user">
      <v-card-text>
        <v-list-item three-line>
          <v-list-item-avatar size="96">
            <v-dialog width="400">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon width="96" height="96" v-on="on" v-bind="attrs">
                  <v-avatar size="96">
                    <v-img :src="user.pfp||'/images/guest.png'" aspect-ratio="1">
                      <v-list-item-content v-if="editing" style="background:rgba(0,0,0,0.4)">
                        <v-card-text class="py-0 white--text">Select</v-card-text>
                      </v-list-item-content>
                    </v-img>
                  </v-avatar>
                </v-btn>
              </template>
              <v-card :disabled="uploading" :loading="uploading">
                <v-card-title>Upload Image</v-card-title>
                <croppa v-model="croppa"
                        :disabled="uploading"
                        prevent-white-space
                        :show-remove-button="false"
                        :zoom-speed="5"
                        :width="400"
                        :height="400"
                        :quality="512/400"
                        :initial-image="user.pfp"></croppa>
                <v-card-actions>
                  <v-btn text color="primary" @click="croppa.chooseFile()">Select Image</v-btn>
                  <v-btn text color="primary" :disabled="croppa&&croppa.hasImage&&!croppa.hasImage()"
                         @click="upload">Upload
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-list-item-avatar>
          <v-list-item-content v-if="editing">
            <v-list-item-title class="text-h5" v-text="user.name"></v-list-item-title>
            <v-text-field class="mb-2" v-model="localCopy.nickname" label="Nickname"
                          hint="Largely ignored but yeh"></v-text-field>
            <v-list-item-subtitle v-text="user.email"></v-list-item-subtitle>
            <v-list-item-subtitle>
              <pre v-text="user.uid"></pre>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-content v-else>
            <v-list-item-title class="text-h5" v-text="user.name"></v-list-item-title>
            <v-list-item-title v-text="user.nickname"></v-list-item-title>
            <v-list-item-subtitle v-text="user.email"></v-list-item-subtitle>
            <v-list-item-subtitle>
              <pre v-text="user.uid"></pre>
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              <v-chip class="ma-1" v-if="user.admin" color="error" label dark small>admin</v-chip>
              <v-chip class="ma-1" v-if="user.teacher" color="info" label dark small>teacher</v-chip>
              <v-chip class="ma-1" v-else outlined label small>student</v-chip>
              <v-chip class="ma-1" v-for="role in user.roles" :key="role" v-text="role" outlined label
                      small></v-chip>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-card-text>
      <v-card-text class="px-10">
        <v-textarea v-if="editing" v-model="localCopy.desc" label="Description" hide-details="auto"></v-textarea>
        <span v-else v-text="user.desc"></span>
      </v-card-text>
      <v-card-text v-show="editing" class="px-10">
        <v-form ref="form">
          <v-text-field label="Current password" v-model="password" hide-details="auto"
                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showPassword = !showPassword" :rules="[...passwordRules]"
                        :type="showPassword?'text':'password'"></v-text-field>
          <v-text-field label="New password" v-model="newPassword" hide-details="auto"
                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showPassword = !showPassword" :rules="[...passwordRules, confirmPasswordRule]"
                        :type="showPassword?'text':'password'"></v-text-field>
          <v-text-field label="Confirm password" v-model="confirmPassword" hide-details="auto"
                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showPassword = !showPassword" :rules="[...passwordRules, confirmPasswordRule]"
                        :type="showPassword?'text':'password'"></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-text>
        <PermissionEditor no-data="No permission overrides" v-model="permissions"></PermissionEditor>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn v-if="editing" color="warning" text @click="cancel">Cancel</v-btn>
        <v-btn color="error" :text="verified" :outlined="!verified" :disabled="verified||verifying" @click="verify"
               v-text="verified?'Verified':'Verify'"></v-btn>
        <v-btn color="accent" :text="linked" :outlined="!linked" :disabled="linked||linking" @click="link"
               v-text="linked?'Linked':'Link'"></v-btn>
        <v-btn :color="editing?'success':'primary'" text @click="!editing?editing=true:save()"
               v-text="editing?'Save':'Edit'"></v-btn>
      </v-card-actions>
    </v-card>
    <v-snackbar
        v-model="emailSnackbar"
        :timeout="3000">A verification email has been sent, please check your inbox.
    </v-snackbar>
    <v-snackbar :value="this.$route.query.askVerify&&!emailSnackbar"
                multi-line>
      Please verify your email to prevent loss of account!
      <template v-slot:action="{ attrs }">
        <v-btn
            color="primary"
            text
            :disabled="verifying"
            v-bind="attrs"
            @click="verify">
          Verify
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import {Component, Ref, Vue, Watch} from "vue-property-decorator"
import {User} from "@/types/user";
import {getToken, post} from "@/mixins/api";
import {
  EmailAuthProvider,
  linkWithPopup,
  OAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  updatePassword
} from "firebase/auth";
import {FirebaseUser} from "@/types/shims/shims-firebase-user";
import {auth} from "@/plugins/firebase";
import Config from "@/store/config"
import PermissionEditor from "@/components/PermissionEditor.vue";
import 'vue-croppa/dist/vue-croppa.css'
// @ts-ignore
import Croppa from 'vue-croppa'
import {VForm} from "@/types/shims/shims-vuetify";

@Component({
  methods: {
    getToken
  },
  components: {
    PermissionEditor,
    croppa: Croppa.component
  }
})
export default class Profile extends Vue {
  @Ref('form') form!: VForm;
  croppa: any = {};
  uploading = false;

  editing = false;
  saving = false;
  localCopy?: User;

  linking = false;
  verifying = false;

  emailSnackbar = false;

  showPassword = false
  password = ""
  newPassword = ""
  confirmPassword = ""

  readonly passwordRules = [
    (v: string) => !!v || "Password is required",
    (v: string) => v.length >= 8 || "Password must be >=8 char long",
  ]

  confirmPasswordRule() {
    return (this.newPassword === this.confirmPassword) || 'Password must match'
  }


  async save() {
    this.saving = true;
    try {
      if (auth.currentUser && auth.currentUser.email && this.newPassword) {
        if (!this.form.validate()) return this.saving = false;
        const credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            this.password
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, this.newPassword)
        this.form.reset();
        await Config.fetchProfile();
      }
      await post('/api/auth/profile', {
        nickname: this.localCopy?.nickname,
        desc: this.localCopy?.desc
      });
      await Config.fetchProfile();
      this.editing = false;
    } catch (e) {
      alert(e.message);
      console.error(e);
    }
    this.saving = false;
  }

  link() {
    if (!auth.currentUser) return;
    this.linking = true;
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({prompt: 'consent'});
    linkWithPopup(auth.currentUser, provider).catch(error => console.error(error)).finally(() => this.linking = false);
  }

  verify() {
    if (!auth.currentUser) return;
    this.verifying = true;
    sendEmailVerification(auth.currentUser).then(() => this.emailSnackbar = true).catch(error => console.error(error)).finally(() => this.verifying = false);
  }

  cancel() {
    this.editing = false;
    if (this.user) this.localCopy = {...this.user};
  }

  upload() {
    this.uploading = true;
    this.croppa.generateBlob((blob: Blob) => {
      const fd = new FormData();
      fd.append('file', blob, 'payload.png');
      post<{ status: string, reason: string }>('/api/auth/pfp', fd).then(res => {
        if (res.status === 'success') Config.fetchProfile();
        else alert("Failed " + res.reason);
      }).finally(() => this.uploading = false)
    }, 'image/png');
  }

  get permissions() {
    return this.user ? Object.entries(this.user.permissions) : [];
  }

  get user(): User | null {
    return Config.profile;
  }

  get fbUser(): FirebaseUser | null {
    return Config.user;
  }

  @Watch('user', {immediate: true, deep: true})
  onUserChange(val: User) {
    this.localCopy = {...val};
  }

  get linked() {
    return Boolean(this.fbUser && this.fbUser.providerData && this.fbUser.providerData.some(p => p && p.providerId === "microsoft.com"))
  }

  get verified() {
    return Boolean(this.fbUser && this.fbUser.emailVerified);
  }
}
</script>

<style scoped>

</style>