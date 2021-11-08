<template>
  <v-container>
    <v-card
        :loading="loading"
        outlined>
      <v-card-title>{{ note.name }}</v-card-title>
      <v-card-subtitle>{{ note.nid }}<br>
        <v-chip label color="primary" small outlined>
          {{ !note.type ? "auto" : note.type }}
        </v-chip>
      </v-card-subtitle>
      <v-card-text>
        <div><strong>Last Edited</strong></div>
        <UserChip :uid.sync="note.lastEditBy" admin>
          <template v-slot:additional>{{ note.lastEdit | moment("MMMM Do YYYY, hh:mm a") }}</template>
        </UserChip>
      </v-card-text>
      <v-card-text v-if="note.desc">
        <v-expansion-panels flat>
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
              <markdown :content="note.desc" :options="$store.state.markdownOptions"></markdown>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
      <v-card-actions>
        <v-btn text color="primary" @click="download">
          Download
        </v-btn>
        <NotePopup editing :preset="note" :cid="cid" v-if="canEdit($store.state.currentCollection)">
          <template v-slot:activator="{on}">
            <v-btn text color="primary" class="ml-4" v-on="on" :disabled="loading">
              Edit
            </v-btn>
          </template>
        </NotePopup>
        <v-btn text color="primary" class="ml-4" :to="{name:'Edit Note', params:{cid,nid}}" :disabled="loading"
               v-if="canEdit($store.state.currentCollection)">
          Edit Source
        </v-btn>
        <v-btn text color="error" class="ml-4" @click="deleteNote" :disabled="loading"
               v-if="canEdit($store.state.currentCollection)">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-divider class="my-3" v-if="this.doc"/>
    <template v-if="this.doc">
      <JupyterViewer v-if="note.type==='jupyter'" :notebook="doc"></JupyterViewer>
      <markdown v-else-if="note.type==='markdown'" :content="doc" :options="$store.state.markdownOptions"></markdown>
    </template>
    <div ref="shadowRoot"></div>
    <v-skeleton-loader
        v-if="loading"
        class="mx-auto"
        type="article,image,article,card"
    ></v-skeleton-loader>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import UserChip from "@/components/UserChip.vue";
import NotePopup from "@/components/NotePopup.vue";
import {del} from "@/api/api";
import JupyterViewer from "@/components/JupyterViewer.vue";
import {Note} from "@/types/note";
import Markdown from "@/components/markdownViewer/Markdown.vue";

const additionalStyles = '<style>\n' +
    '.container{width:auto!important;}\n' +
    '#notebook-container{padding:0!important;-webkit-box-shadow:none!important;box-shadow:none!important;}\n' +
    '.prompt{min-width:0;}\n' +
    '</style>\n' +
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">\n' +
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/github-markdown-css/2.2.1/github-markdown.css"/>\n' +
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/styles/default.min.css">';
// @ts-ignore
@Component({
  components: {
    JupyterViewer,
    NotePopup,
    UserChip, Markdown
  }
})
export default class NoteViewer extends Vue {
  @Ref('shadowRoot') readonly shadowRoot!: HTMLDivElement

  @Prop(String) readonly cid?: string;
  @Prop(String) readonly nid?: string;
  name = "NoteViewer";
  doc?: any = null;
  loading = false;
  shadow?: ShadowRoot;

  @Watch('doc')
  onDocChange() {
    if (!this.shadow) return;
    this.shadow.innerHTML = "";
    if (this.note.type && this.note.type !== "html") return;
    this.shadow.innerHTML = additionalStyles + this.doc;
  }

  mounted() {
    this.shadow = this.shadowRoot.attachShadow({mode: 'open'});
    this.onNoteChange();
  }

  get note(): Note {
    return this.$store.state.currentNote;
  }

  @Watch('nid')
  onNoteChange() {
    this.doc = "";
    this.loading = true;
    this.$store.cache.dispatch("getCollectionNotes", this.cid).then((res: NoteViewer[]) => {
      this.$store.commit('setCurrentNotes', res);
      return res.find(n => n.nid === this.nid);
    }).then(json => {
      if (!json) return this.$router.push(`/collections/${this.cid}`);
      this.$store.commit("setCurrentNote", json);
      if (this.note.url) fetch(this.note.url).then(res => res.text()).then(text => {
        this.doc = this.note.type === "jupyter" ? JSON.parse(text) : text;
      }); else this.doc = "";
      this.loading = false;
    })
  }

  @Watch('$route.hash')
  onHashChange() {
    if (!this.shadow) return;
    let elementToFocus = this.shadow.getElementById(window.location.hash.slice(1)) || this.shadow.querySelector(`[name='${window.location.hash.slice(1)}']`);
    if (elementToFocus) elementToFocus.scrollIntoView();
  }

  deleteNote() {
    if (prompt("Confirm Deletion?", 'Note ID') !== this.nid) return;
    this.loading = true;
    del(`/api/collections/${this.cid}/notes/${this.nid}`).then(res => res.json()).then(json => {
      if (json.status !== 'success') throw json.reason;
      this.loading = false;
      this.$store.cache.dispatch("getCollectionNotes", this.cid).then((res: NoteViewer[]) => this.$store.commit('setCurrentNotes', res));
      if (!this.cid) return;
      this.$router.push({name: 'Collection', params: {cid: this.cid}});
    });
  }

  download() {
    const url = window.URL.createObjectURL(new Blob([this.note.type === "jupyter" ? JSON.stringify(this.doc) : this.doc]));
    const a = document.createElement('a');
    a.href = url;
    a.download = this.note.nid + (this.note.type === "jupyter" ? '.ipynb' : this.note.type === "markdown" ? '.md' : '.html');
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
</script>