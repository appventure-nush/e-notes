<template>
  <v-container>
    <v-card :loading="loading" outlined>
      <v-card-title>{{ note.name }}</v-card-title>
      <v-card-subtitle>{{ note.nid }}<br>
        <v-chip label color="primary" small outlined>
          {{ !note.type ? "auto" : note.type }}
        </v-chip>
      </v-card-subtitle>
      <v-card-text>
        <div><strong>Last Edited</strong></div>
        <UserAvatar :uid="note.lastEditBy" admin classes="ma-1">
          <template v-slot:additional>{{ note.lastEdit | moment("MMMM Do YYYY, hh:mm a") }}</template>
        </UserAvatar>
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
      <v-card-actions v-if="canEdit($store.state.currentCollection)">
        <v-btn text color="primary" @click="download">
          Download
        </v-btn>
        <NotePopup editing :preset="note" :cid="cid">
          <template v-slot:activator="{on}">
            <v-btn text color="primary" class="ml-4" v-on="on" :disabled="loading">
              Edit
            </v-btn>
          </template>
        </NotePopup>
        <v-btn text color="primary" class="ml-4" :to="{name:'Edit Note', params:{cid:cid,nid:nid}}" :disabled="loading">
          Edit Source
        </v-btn>
        <v-btn text color="error" class="ml-4" @click="deleteNote" :disabled="loading">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-divider class="my-3"/>
    <v-card class="pa-5" flat :loading="doc_loading">
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
    </v-card>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import NotePopup from "@/components/NotePopup.vue";
import {del} from "@/mixins/api";
import JupyterViewer from "@/components/JupyterViewer.vue";
import {Note} from "@/types/note";
import Markdown from "@/components/markdownViewer/Markdown.vue";
import UserAvatar from "@/components/UserAvatar.vue";

@Component({
  components: {
    UserAvatar,
    JupyterViewer,
    NotePopup,
    Markdown
  }
})
export default class NoteViewer extends Vue {
  @Ref('shadowRoot') readonly shadowRoot!: HTMLDivElement

  @Prop(String) readonly cid!: string;
  @Prop(String) readonly nid!: string;
  @Prop(Array) readonly notes!: Note[];
  name = "NoteViewer";
  doc: any = "";
  loading = false;
  doc_loading = false;
  shadow?: ShadowRoot;

  @Watch('doc')
  onDocChange() {
    if (!this.shadow) return;
    this.shadow.innerHTML = "";
    if (this.note.type && this.note.type !== "html") return;
    this.shadow.innerHTML = this.doc;
  }

  mounted() {
    this.shadow = this.shadowRoot.attachShadow({mode: 'open'});
  }

  get note(): Note {
    return this.$store.state.currentNote || {};
  }


  @Watch('notes', {immediate: true})
  onNotesChange() {
    this.onNIDChange();
  }

  @Watch('nid', {immediate: true})
  onNIDChange() {
    if (this.notes.length === 0) return;
    this.doc = "";
    this.loading = true;
    let note = this.notes.find((n: Note) => n.nid === this.nid);
    if (!note) return this.$router.push({name: 'Collection', params: {cid: this.cid || ''}});
    this.$store.commit("setCurrentNote", note);
    this.loading = false;
  }

  @Watch('note', {immediate: true, deep: true})
  onNoteChanged() {
    if (this.note.url) {
      this.doc_loading = true;
      fetch(this.note.url).then(res => res.text()).then(text => {
        if (!this.note) return;
        this.doc = this.note.type === "jupyter" ? JSON.parse(text) : text;
        this.doc_loading = false;
      });
    } else this.doc = "";
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
      if (!this.cid) return;
      this.$router.push({name: 'Collection', params: {cid: this.cid}});
    });
  }

  download() {
    if (!this.note) return;
    const url = window.URL.createObjectURL(new Blob([this.note.type === "jupyter" ? JSON.stringify(this.doc) : this.doc]));
    const a = document.createElement('a');
    a.href = url;
    a.download = this.note.nid + (this.note.type === "jupyter" ? '.ipynb' : this.note.type === "markdown" ? '.md' : '.html');
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
</script>