<template>
  <v-card outlined shaped :loading="loading">
    <v-card-title v-text="collection.name"></v-card-title>
    <v-card-subtitle class="pb-2" v-text="collection.cid"></v-card-subtitle>
    <v-chip class="mx-4 mb-2" small label :color="collection.open?'success':'error'"
            v-text="collection.open?'Open':'Private'"></v-chip>
    <v-card-text>
      <v-expansion-panels :value="0" flat>
        <v-expansion-panel v-if="collection.desc">
          <v-expansion-panel-header expand-icon="mdi-menu-down">
                <span>
                <v-icon small>
                  mdi-text-long
                </v-icon>
                Description
                </span>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <markdown :content="collection.desc" :options="$store.state.markdownOptions"></markdown>
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
            <UserChip :uid.sync="collection.owner" admin></UserChip>
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
                <v-icon small>mdi-file-document-multiple</v-icon> Notes</span>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card :loading="reordering" flat :disabled="reordering">
              <v-list dense nav>
                <draggable v-model="notes" handle=".handle" @change="onReorder">
                  <v-slide-y-transition group>
                    <v-list-item
                        :to="{name:'Note',params:{cid:$route.params.cid,nid:note.nid}}"
                        v-for="note in notes"
                        :key="note.nid">
                      {{ note.name }}
                      <v-spacer/>
                      <v-icon v-if="canEdit(collection)" style="cursor: grab;" class="handle">mdi-swap-vertical-bold
                      </v-icon>
                    </v-list-item>
                  </v-slide-y-transition>
                </draggable>
              </v-list>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
    <v-card-actions v-if="canEdit($store.state.currentCollection)">
      <CollectionPopup editing :preset="collection">
        <template v-slot:activator="{on}">
          <v-btn text color="primary" v-on="on">
            Edit
          </v-btn>
        </template>
      </CollectionPopup>
      <NotePopup :cid="collection.cid">
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

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import draggable from 'vuedraggable'
import {del, post} from "@/mixins/api";
import UserChip from "@/components/UserChip.vue";
import {VUFile} from "@/shims-others";
import VueUploadComponent from "vue-upload-component";
import CollectionPopup from "@/components/CollectionPopup.vue";
import Gallery from "@/components/Gallery.vue";
import NotePopup from "@/components/NotePopup.vue";
import Markdown from "@/components/markdownViewer/Markdown.vue";
import {Collection} from "@/types/coll";
import {Note} from "@/types/note";

@Component({
  components: {
    draggable,
    NotePopup,
    Gallery,
    CollectionPopup,
    UserChip,
    Markdown
  }
})
export default class CollectionInfo extends Vue {
  @Prop(String) readonly cid?: string;
  @Prop(Boolean) readonly loading!: boolean;
  @Prop(Object) readonly collection!: Collection;
  @Ref('upload') upload?: VueUploadComponent;
  name = "CollectionInfo";
  files: VUFile[] = [];
  deleting: string[] = [];
  images: { url: string, name: string }[] = [];
  blobs: { [name: string]: string } = {};

  reordering = false;

  notes: Note[] = [];

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

  @Watch('cid')
  onCIDChange() {
    this.deleting = [];
    this.images = [];
    this.files = [];
    this.notes = [...this.$store.state.currentNotes];
    this.$store.cache.dispatch("getCollectionImages", this.cid).then(json => this.images = json);
  }

  mounted() {
    this.onCIDChange();
  }

  @Watch('$store.state.currentNotes')
  onNotesChange(val: Note[]) {
    this.notes = [...val];
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

  createObjectURL(object: File) {
    if (this.blobs[object.name]) return this.blobs[object.name];
    return this.blobs[object.name] = URL.createObjectURL(object);
  }

  onReorder() {
    let payload: { [nid: string]: number } = {};
    this.notes.forEach((v, i) => payload[v.nid] = i);
    this.reordering = true;
    post(`/api/collections/${this.cid}/reorder`, payload).then(res => res.json()).then(json => {
      if (json.status !== 'success') throw json.reason;
      this.$store.commit('setCurrentNotes', json.notes);
    }).catch(e => console.error(e)).finally(() => {
      this.notes = [...this.$store.state.currentNotes];
      this.reordering = false;
    })
  }
}
</script>