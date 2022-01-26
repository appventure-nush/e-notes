<template>
  <v-container>
    <div class="text-center" v-if="showPages">
      <v-pagination
          v-model="page"
          :length="notes.length"
      ></v-pagination>
    </div>
    <v-card :loading="loading" outlined>
      <v-card-title>{{ note.name }}{{ date ? `@${date}` : '' }}</v-card-title>
      <v-card-subtitle>{{ note.nid }}<br>
        <v-chip label color="primary" small outlined>
          {{ !note.type ? "auto" : note.type }}
        </v-chip>
      </v-card-subtitle>
      <v-card-text>
        <div><strong>Last Edited</strong></div>
        <UserAvatar :uid="note.lastEditBy" admin classes="ma-1">
          <template v-slot:additional>{{ moment(note.lastEdit).format("MMMM Do YYYY, hh:mm a") }}</template>
        </UserAvatar>
      </v-card-text>
      <v-expansion-panels flat>
        <v-expansion-panel v-if="note.desc">
          <v-expansion-panel-header expand-icon="mdi-menu-down">
                <span>
                <v-icon small>
                  mdi-text-long
                </v-icon>
                Description
                </span>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <markdown :content="note.desc"></markdown>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header expand-icon="mdi-menu-down">
                <span>
                <v-icon small>
                  mdi-clock-outline
                </v-icon>
                History
                </span>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-list dense two-line>
              <v-list-item :to="{name:'Note',params:{nid:nid}}" exact>
                <v-list-item-content class="pa-0">
                  <v-list-item-title>Latest</v-list-item-title>
                  <span>now</span>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-for="(h,i) in history" :key="i" :to="{name:'Note History',params:{nid:nid,date:h.date}}"
                           exact>
                <v-list-item-content class="pa-0">
                  <v-list-item-title v-text="h.uuid"></v-list-item-title>
                  <span v-text="moment(h.date).format('YYYY MMM DD, HH:mm:ss')"></span>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-card-actions>
        <template v-if="date">
          <v-btn text color="error" @click="revert" disabled>
            Revert
          </v-btn>
          <v-btn text class="ml-4" :disabled="loading"
                 :to="{name:'Note Compare', params:{old:date, new:'now', nid:nid}}">
            Compare
          </v-btn>
        </template>
        <template v-else-if="canEdit(currentCollection)">
          <NotePopup editing :preset="note" :cid="cid">
            <template v-slot:activator="{on}">
              <v-btn text color="primary" v-on="on" :disabled="loading">
                Edit
              </v-btn>
            </template>
          </NotePopup>
          <v-btn text color="primary" class="ml-4" :to="{name:'Edit Note', params:{cid:cid,nid:nid}}"
                 :disabled="loading">
            Edit Source
          </v-btn>
          <v-btn text color="error" class="ml-4" @click="deleteNote" :disabled="loading">
            Delete
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
    <v-divider class="my-3"/>
    <blockquote class="red--text" v-if="errorJSON">JSON Parse Error</blockquote>
    <pre v-show="errorJSON" v-text="doc"></pre>
    <v-card class="pb-2" flat :loading="doc_loading" :disabled="doc_loading"
            :class="{'px-5':$vuetify.breakpoint.mdAndUp}" v-show="!errorJSON">
      <template v-if="this.doc">
        <JupyterViewer v-if="note.type==='jupyter'&&!errorJSON" :notebook="doc"></JupyterViewer>
        <markdown v-else-if="note.type==='markdown'" :content="doc"></markdown>
      </template>
      <div ref="shadowRoot" v-show="note.type!=='markdown'&&note.type!=='jupyter'"></div>
      <v-skeleton-loader
          v-if="loading"
          class="mx-auto"
          type="article,image,article,card"
      ></v-skeleton-loader>
    </v-card>
    <div class="text-center" v-if="showPages">
      <v-pagination
          v-model="page"
          :length="notes.length"
      ></v-pagination>
    </div>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import NotePopup from "@/components/popup/NotePopup.vue";
import {del, get} from "@/mixins/api";
import JupyterViewer from "@/components/notebookViewer/JupyterViewer.vue";
import {Note} from "@/types/note";
import UserAvatar from "@/components/UserAvatar.vue";
import Data from "@/store/data"
import Config from "@/store/config"
import {Collection} from "@/types/coll";
import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowVulnerableTags: true,
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'hr', 'style']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['id', 'class'],
    'img': ['border', 'width', 'height', 'align', 'src']
  }
};

@Component({
  components: {
    UserAvatar,
    JupyterViewer,
    NotePopup,
    Markdown: () => import(/* webpackChunkName: "markdown" */"@/components/markdownViewer/Markdown.vue")
  }
})
export default class NoteViewer extends Vue {
  @Ref('shadowRoot') readonly shadowRoot!: HTMLDivElement

  @Prop(Number) readonly date?: number;
  @Prop(String) readonly cid!: string;
  @Prop(String) readonly nid!: string;
  @Prop(Array) readonly notes!: Note[];
  name = "NoteViewer";
  doc: any = "";
  loading = false;
  doc_loading = false;
  errorJSON = false;
  shadow?: ShadowRoot;
  history: { date: number; uuid: string }[] = [];

  @Watch('doc', {immediate: true})
  onDocChange() {
    if (!this.shadow && this.shadowRoot) this.shadow = this.shadowRoot.attachShadow({mode: 'open'});
    if (this.shadow && (!this.note.type || this.note.type === 'html')) this.shadow.innerHTML = this.sanitize ? sanitizeHtml(this.doc, SANITIZE_OPTIONS) : this.doc;
  }

  updated() {
    if (location.hash)
      document.getElementById(location.hash.substring(1))?.scrollIntoView();
  }

  get note(): Note {
    return Data.currentNote || {} as Note;
  }

  get currentCollection(): Collection {
    return Data.currentCollection || {} as Collection;
  }

  set page(page: number) {
    this.$router.push({name: 'Note Redirect', params: {cid: this.cid, nid: this.notes[page - 1].nid}});
  }

  get page(): number {
    return this.notes.findIndex(n => n.nid === this.nid) + 1;
  }

  get showPages() {
    return Config.settings.showPages;
  }

  @Watch('nid', {immediate: true})
  onNIDChange() {
    window.scrollTo(0, 0);
    get<{ notes: { date: number, uuid: string }[] }>(`/api/collections/${this.cid}/notes/${this.nid}/history`)
        .then(res => this.history = res.notes).catch(e => alert(e.message));
    Data.fetchNotes(this.cid);
    this.updateNote();
  }

  @Watch('notes', {immediate: true})
  updateNote() {
    if (!this.notes) return;
    if (this.notes.length === 0) return;
    let note = this.notes.find((n: Note) => n.nid === this.nid);
    if (!note) return this.$router.push({name: 'Collection', params: {cid: this.cid || ''}});
    Data.setCurrentNote(note)
  }

  last_url = "";

  @Watch('date')
  @Watch('note', {immediate: true, deep: true})
  onNoteChanged() {
    if (this.note) {
      const req_url = `/raw/c/${encodeURIComponent(this.cid)}/notes/${encodeURIComponent(this.nid)}`
          + (this.date ? '/' + this.date : '') + (this.date ? '' : "?" + this.note.lastEdit);
      if (req_url === this.last_url) return;
      this.doc = null;
      this.last_url = req_url;
      this.doc_loading = true;
      fetch(req_url).then(res => res.text()).then(text => {
        if (this.last_url !== req_url) return;
        if (!this.note) return;
        try {
          this.errorJSON = false;
          this.doc = this.note.type === "jupyter" ? JSON.parse(text) : text;
        } catch (e) {
          this.errorJSON = true;
          this.doc = text;
        }
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

  revert() {
    //
  }

  deleteNote() {
    if (prompt("Confirm Deletion?", 'Note ID') !== this.nid) return;
    this.loading = true;
    del(`/api/collections/${this.cid}/notes/${this.nid}`).then(() => {
      this.loading = false;
      if (!this.cid) return;
      this.$router.push({name: 'Collection', params: {cid: this.cid}});
    });
  }

  get sanitize() {
    return !Config.settings.noSanitize;
  }
}
</script>