<template>
  <v-container fluid style="min-height:100%">
    <template v-if="$route.name==='Collection'">
      <v-card outlined shaped>
        <v-card-title v-text="coll.name"></v-card-title>
        <v-card-subtitle class="pb-2" v-text="coll.cid"></v-card-subtitle>
        <v-chip class="mx-4 mb-2" small label :color="coll.open?'success':'error'"
                v-text="coll.open?'Open':'Private'"></v-chip>
        <v-card-text>
          <v-expansion-panels :value="0" flat>
            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">
                <span>
                <v-icon small>
                  mdi-text-long
                </v-icon>
                Description
                </span>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <markdown :content="coll.desc" :options="$store.state.markdownOptions"></markdown>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down"><span>
                <v-icon small>
                  mdi-lock
                </v-icon>
                Permissions</span>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div><strong>Roles with access</strong></div>
                <v-chip class="mx-1" small label
                        v-for="role in $store.state.currentRoles"
                        v-text="role.rid"
                        :key="role.rid">
                </v-chip>
                <div class="mt-2"><strong>Owner</strong></div>
                <UserChip :uid.sync="coll.owner" admin></UserChip>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down"><span>
                <v-icon small>mdi-image-multiple</v-icon>
                Images</span>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div class="mx-4 mb-4">
                  <div v-if="canEdit($store.state.currentCollection)">
                    <v-btn outlined :disabled="upload&&upload.active" class="mr-2"
                           @click="upload.$el.children[0].click()">
                      <v-icon left>
                        mdi-upload
                      </v-icon>
                      Select Files
                      <file-upload ref="upload"
                                   v-model="files"
                                   accept="image/*"
                                   :thread="3"
                                   :timeout="60 * 1000"
                                   :drop="true"
                                   :multiple="true"
                                   :post-action="`/api/collections/${cid}/img`">
                      </file-upload>
                    </v-btn>
                    <v-btn @click="initUpload" text>Upload</v-btn>
                    <span v-show="upload && upload.dropActive">Drag and drop here for upload</span>
                  </div>
                  <v-list v-if="files.length>0">
                    <v-card :loading="files[i].active" flat v-for="(f,i) in files" :key="`upload_list_${f.name}`">
                      <template slot="progress">
                        <v-progress-linear
                            :value="parseFloat(files[i].progress)"
                            height="2"
                        ></v-progress-linear>
                      </template>
                      <v-list-item>
                        <v-list-item-avatar>
                          <v-img :src="createObjectURL(f.file)"></v-img>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title v-text="f.name"></v-list-item-title>
                          <v-list-item-subtitle v-text="humanFileSize(f.size)"></v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn icon small @click="upload.remove(f)">
                            <v-icon color="red lighten-1">mdi-close</v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </v-card>
                  </v-list>
                </div>
                <Gallery v-model="images" :deleting="deleting" @delete="deleteImage($event)"></Gallery>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down"><span>
                <v-icon small>mdi-file-document-multiple</v-icon>
                Notes</span>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-list>
                  <v-list-item
                      :to="{name:'Note',params:{cid:$route.params.cid,nid:note.nid}}"
                      v-for="note in $store.state.currentNotes"
                      :key="note.nid">
                    {{ note.name }}
                  </v-list-item>
                </v-list>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions v-if="canEdit($store.state.currentCollection)">
          <CollectionPopup editing :preset="coll">
            <template v-slot:activator="{on}">
              <v-btn text color="primary" v-on="on">
                Edit
              </v-btn>
            </template>
          </CollectionPopup>
          <NotePopup :cid="coll.cid">
            <template v-slot:activator="{on}">
              <v-btn text color="primary" v-on="on" class="ml-4">
                New Note
              </v-btn>
            </template>
          </NotePopup>
          <v-btn text color="error" class="ml-4">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
    <router-view></router-view>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import {del} from "@/api/api";
import UserChip from "@/components/UserChip.vue";
import {VUFile} from "@/shims-others";
import VueUploadComponent from "vue-upload-component";
import CollectionPopup from "@/components/CollectionPopup.vue";
import Gallery from "@/components/Gallery.vue";
//@ts-ignore
import MarkdownItVueLight from 'markdown-it-vue/dist/markdown-it-vue-light.umd.min.js'
import 'markdown-it-vue/dist/markdown-it-vue-light.css'
import NotePopup from "@/components/NotePopup.vue";
import '@/styles/github-dark.scss';

@Component({
  components: {
    NotePopup,
    Gallery,
    CollectionPopup,
    UserChip,
    markdown: MarkdownItVueLight as any
  }
})
export default class Collection extends Vue {
  @Prop(String) readonly cid?: string;
  @Ref('upload') upload?: VueUploadComponent;
  name = "Collection";
  files: VUFile[] = [];
  deleting: string[] = [];
  images: { url: string, name: string }[] = [];
  blobs: { [name: string]: string } = {};

  @Watch('cid')
  onCIDChange() {
    this.deleting = [];
    this.images = [];
    this.files = [];
    this.$store.cache.dispatch("getCollection", this.cid).then(json => {
      if (json.status && json.status !== "success") {
        console.log(json);
        return this.$router.push("/");
      }
      this.$store.commit("setCurrentColl", json);
    });
    this.$store.cache.dispatch("getCollectionRoles", this.cid).then(json => this.$store.commit("setCurrentRoles", json));
    this.$store.cache.dispatch("getCollectionNotes", this.cid).then(json => this.$store.commit("setCurrentNotes", json));
    this.$store.cache.dispatch("getCollectionImages", this.cid).then(json => this.images = json);
  }

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
        url: (f.response as any).url
      })
    }
  }

  mounted() {
    this.onCIDChange();
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

  createObjectURL(object: File) {
    if (this.blobs[object.name]) return this.blobs[object.name];
    return this.blobs[object.name] = URL.createObjectURL(object);
  }
}
</script>

<style scoped>

</style>