<template>
  <v-container>
    <template v-if="$route.name==='Collection'">
      <v-card outlined shaped>
        <v-card-title v-text="coll.name"></v-card-title>
        <v-card-subtitle class="pb-2" v-text="coll.cid"></v-card-subtitle>
        <v-chip class="mx-4 mb-2" small label :color="coll.open?'success':'error'"
                v-text="coll.open?'Open':'Private'"></v-chip>
        <v-divider/>
        <v-card-text>
          <markdown :content="coll.desc" :options="$store.state.markdownOptions"></markdown>
        </v-card-text>

        <v-card-text class="pb-2"><strong>Roles with access</strong></v-card-text>
        <div class="mx-3">
          <v-chip class="mx-1" small label
                  v-for="role in $store.state.currentRoles"
                  v-text="role.rid"
                  :key="role.rid">
          </v-chip>
        </div>
        <v-card-text class="pb-2"><strong>Owner</strong></v-card-text>
        <div class="mx-4">
          <UserChip :uid.sync="coll.owner" admin></UserChip>
        </div>
        <v-card-text class="pb-2"><strong>Images</strong></v-card-text>
        <div class="mx-4 mb-4">
          <div v-if="$store.state.profile.admin">
            <v-btn outlined :disabled="upload&&upload.active" class="mr-2">
              <v-icon left>
                mdi-upload
              </v-icon>
              <file-upload ref="upload"
                           :thread="3"
                           :timeout="60 * 1000"
                           v-model="files"
                           :drop="true"
                           :multiple="true"
                           accept="image/*"
                           :post-action="`/api/collections/${cid}/img`">
                Select Images
              </file-upload>
            </v-btn>
            <v-btn @click="initUpload" text>Upload</v-btn>
          </div>
          <v-list v-if="files.length>0">
            <v-card :loading="files[i].active" elevation="0" v-for="(f,i) in files" :key="`upload_list_${f.name}`">
              <v-list-item>
                <v-list-item-avatar>
                  <v-img :src="createObjectURL(f.file)"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <template slot="progress">
                    <v-progress-linear
                        v-model="files[i].progress"
                        height="2"
                    ></v-progress-linear>
                  </template>
                </v-list-item-content>
                <v-list-item-title>{{ f.name }}</v-list-item-title>
              </v-list-item>
            </v-card>
          </v-list>
          <v-row class="ma-2">
            <v-col cols="6" sm="4" md="3" lg="2"
                   :key="image.name" class="pa-2"
                   v-for="image in images">
              <v-card elevation="0" outlined :loading="deleting.includes(image.name)">
                <template slot="progress">
                  <v-progress-linear
                      indeterminate
                      height="2"
                  ></v-progress-linear>
                </template>
                <v-img :src="image.src" aspect-ratio="1"
                       class="white--text align-end">
                  <v-list-item-content class="pb-0" style="background:rgba(0,0,0,0.4)">
                    <v-card-text class="py-0">{{ image.name }}</v-card-text>
                    <v-btn
                        v-if="$store.state.profile.admin"
                        color="red" text @click="deleteImage(image.name)" :disabled="deleting.includes(image.name)">
                      Delete
                    </v-btn>
                  </v-list-item-content>
                </v-img>
              </v-card>
            </v-col>
          </v-row>
        </div>
        <v-card-actions>
          <v-btn text>
            Hello
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
    <router-view></router-view>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import {del, get} from "@/api/api";
import MarkdownItVue from 'markdown-it-vue'
import 'markdown-it-vue/dist/markdown-it-vue.css'
import UserChip from "@/components/UserChip.vue";
import {VUFile} from "@/shims-others";
import VueUploadComponent from "vue-upload-component";

@Component({
  components: {
    UserChip,
    markdown: MarkdownItVue as any
  }
})
export default class Collection extends Vue {
  @Prop(String) readonly cid?: string;
  @Ref('upload') upload?: VueUploadComponent;
  name = "Collection";
  files: VUFile[] = [];

  @Watch('files')
  onFilesChange() {
    if (!this.upload) return;
    let done = this.files.filter(f => f.success);
    for (const f of done) {
      this.upload.remove(f);
      let index = this.images.findIndex(i => i.name === f.name);
      if (index > -1) this.images.splice(index, 1);
      this.images.push({
        name: f.name,
        src: (f.response as any).url
      })
    }
  }

  deleting: string[] = [];
  images: { src: string, name: string }[] = [];

  mounted() {
    get(`/api/collections/${this.cid}`).then(res => res.json()).then(json => {
      if (json.status && json.status !== "success") {
        console.log(json);
        return this.$router.push("/");
      }
      this.$store.commit("setCurrentColl", json);
    });
    get(`/api/collections/${this.cid}/roles`).then(res => res.json()).then(json => this.$store.commit("setCurrentRoles", json));
    get(`/api/collections/${this.cid}/notes`).then(res => res.json()).then(json => this.$store.commit("setCurrentNotes", json));
    get(`/api/collections/${this.cid}/img`).then(res => res.json()).then(json => this.images = json);
  }

  initUpload() {
    if (!this.upload) return;
    this.upload.active = true;
  }

  deleteImage(img: string) {
    this.deleting.push(img);
    del(`/api/collections/${this.cid}/img/${img}`).then(res => res.json()).then(status => {
      let index = this.deleting.findIndex(i => i === img);
      if (index > -1) this.deleting.splice(index, 1);
      if (status.status !== 'success') return alert(status.reason);
      index = this.images.findIndex(i => i.name === img);
      if (index > -1) this.images.splice(index, 1);
    });
  }

  get coll() {
    return this.$store.state.currentCollection;
  }

  blobs: { [name: string]: string } = {};

  createObjectURL(object: File) {
    if (this.blobs[object.name]) return this.blobs[object.name];
    return this.blobs[object.name] = URL.createObjectURL(object);
  }
}
</script>

<style scoped>

</style>