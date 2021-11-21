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
              <v-card :disabled="upload&&upload.active" :loading="upload&&upload.active">
                <v-card-title>Upload Image</v-card-title>
                <v-card @click="upload.$el.children[0].click()" flat tile>
                  <v-img aspect-ratio="1" :src="files.length>0?createObjectURL(files[0].file):user.pfp">
                    <v-list-item-content v-if="files.length===0"
                                         style="background:rgba(0,0,0,0.4);width:100%;height:100%;">
                      <v-card-text class="white--text text-center text-h5">Select Image</v-card-text>
                    </v-list-item-content>
                  </v-img>
                  <file-upload ref="upload"
                               :headers="{'x-xsrf-token': getToken()}"
                               v-show="false"
                               v-model="files"
                               accept="image/*"
                               :size="16 * 1024 * 1024"
                               :timeout="60 * 1000"
                               :multiple="false"
                               @input-file="inputFile"
                               post-action="/api/auth/pfp">
                  </file-upload>
                </v-card>
                <v-card-actions>
                  <v-btn text color="primary" @click="upload.$el.children[0].click()">Select Image</v-btn>
                  <v-btn text color="primary" :disabled="files.length===0||(upload&&upload.active)"
                         @click="upload.active=true">Upload
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
        <v-textarea v-if="editing" v-model="localCopy.desc" label="Description"></v-textarea>
        <span v-else v-text="user.desc"></span>
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
  </v-container>
</template>

<script lang="ts">
import {Component, Ref, Vue, Watch} from "vue-property-decorator"
import {User} from "@/types/user";
import VueUploadComponent from "vue-upload-component";
import {VUFile} from "@/types/shims/shims-others";
import {getToken, post} from "@/mixins/api";
import {linkWithPopup, OAuthProvider, sendEmailVerification} from "firebase/auth";
import {FirebaseUser} from "@/types/shims/shims-firebase-user";
import {auth} from "@/plugins/firebase";
import Config from "@/store/config"

@Component({
  methods: {
    getToken
  },
  components: {
    FileUpload: VueUploadComponent,
  }
})
export default class Profile extends Vue {
  @Ref('upload') upload!: VueUploadComponent;
  files: VUFile[] = [];

  editing = false;
  saving = false;
  blobs: { [name: string]: string } = {};
  localCopy?: User;

  linking = false;
  verifying = false;

  linked = false;
  verified = false;

  emailSnackbar = false;

  inputFile(newFile: VUFile, oldFile: VUFile) {
    if (newFile && oldFile && !newFile.active && oldFile.active) {
      if (newFile.success) {
        let res = newFile.response as any;
        if (res.status !== 'success') alert(res.reason);
        else Config.fetchProfile();
        this.upload.remove(newFile);
      }
    }
  }

  createObjectURL(object: File) {
    if (this.blobs[object.name]) return this.blobs[object.name];
    return this.blobs[object.name] = URL.createObjectURL(object);
  }

  save() {
    this.saving = true;
    post('/api/auth/profile', {
      nickname: this.localCopy?.nickname,
      desc: this.localCopy?.desc
    }).then(() => {
      Config.fetchProfile();
      this.editing = false;
    }).finally(() => this.saving = false);
  }

  link() {
    if (!auth.currentUser) return;
    this.linking = true;
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({prompt: 'consent'});
    linkWithPopup(auth.currentUser, provider).then(() => Config.setUser(auth.currentUser)).catch(error => console.error(error)).finally(() => this.linking = false);
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

  @Watch('fbUser', {immediate: true, deep: true})
  onFirebaseUserChange(user: FirebaseUser) {
    this.linked = Boolean(user && user.providerData && user.providerData.some(p => p && p.providerId === "microsoft.com"));
    this.verified = Boolean(user && user.emailVerified);
  }
}
</script>

<style scoped>

</style>