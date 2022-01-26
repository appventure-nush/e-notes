<template>
  <v-card flat tile :loading="loading" :disabled="loading" :class="{'editor-window':note.type!=='jupyter'}">
    <JupyterEditor v-if="note.type==='jupyter'" v-model="notebook"></JupyterEditor>
    <markdown-editor v-else-if="note.type==='markdown'" v-model="doc"></markdown-editor>
    <prism-editor class="editor" v-else v-model="doc" :highlight="highlighter" line-numbers></prism-editor>
  </v-card>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {Note} from "@/types/note";
import {PrismEditor} from 'vue-prism-editor';
import hljs from 'highlight.js/lib/common';
import pretty from "pretty";
import {formatFromString, MarkdownFormatterOptions, RemarkStringifyOptions} from "@quilicicf/markdown-formatter";

import 'vue-prism-editor/dist/prismeditor.min.css';
import '@/styles/github-dark.scss';
import {EventBus} from "@/event";
import {post} from "@/mixins/api";
import Data from "@/store/data"
import MarkdownEditor from "@/components/MarkdownEditor.vue";
import JupyterEditor from "@/components/notebookViewer/JupyterEditor.vue";
import {Notebook} from "@/types/shims/shims-nbformat-v4";
import {denormaliseJupyterOutput, normaliseJupyterOutput} from "@/mixins/helpers";
import {NavigationGuardNext, Route} from "vue-router";

const MD_FORMAT_OPTIONS: MarkdownFormatterOptions = {
  watermark: "none"
};
const MD_STRINGIFY_OPTIONS: RemarkStringifyOptions = {
  bullet: "-"
};

@Component({
  components: {
    JupyterEditor,
    PrismEditor,
    MarkdownEditor
  }
})
export default class NoteEditor extends Vue {
  @Prop(String) readonly cid!: string;
  @Prop(String) readonly nid!: string;
  @Prop(Array) readonly notes!: Note[];
  name = "NoteEditor";
  doc = '';
  notebook: Notebook = {metadata: {}, cells: [], nbformat_minor: 0, nbformat: 0}
  loading = false;
  saved = false;

  created() {
    EventBus.$on('appbar-action', (action: string) => this.handle(action));
  }

  handle(action: string) {
    if (!this.cid || !this.nid) return;
    if (!this.note) return;
    if (action === 'format') {
      if (this.note.type === 'jupyter') this.notebook.cells.forEach(cell => {
        if (cell.cell_type === 'markdown') formatFromString(normaliseJupyterOutput(cell.source), MD_FORMAT_OPTIONS, MD_STRINGIFY_OPTIONS).then(res => cell.source = denormaliseJupyterOutput(res.value.toString()));
      })
      else if (this.note.type === 'markdown') formatFromString(this.doc, MD_FORMAT_OPTIONS, MD_STRINGIFY_OPTIONS).then(res => this.doc = res.value.toString());
      else this.doc = pretty(this.doc, {ocd: true});
    } else if (action === 'save') {
      this.loading = true;

      const formData = new FormData();
      if (this.note.type === 'jupyter') formData.append('note_source',
          new Blob([JSON.stringify(this.notebook)], {type: 'application/x-ipynb+json'}), 'note_source.ipynb');
      else if (this.note.type === 'markdown') formData.append('note_source',
          new Blob([this.doc], {type: 'text/markdown'}), 'note_source.md');
      else formData.append('note_source',
            new Blob([this.doc], {type: 'text/html'}), 'note_source.html');
      if (!this.cid) return;
      post<{ note: Note }>(`/api/collections/${this.cid}/notes/${this.nid}/upload`, formData).then(() => {
        this.loading = false;
        if (!this.cid) return;
        Data.fetchNotes(this.cid);
        if (!this.cid || !this.nid) return;
        this.saved = true;
        this.$router.push({name: 'Note', params: {cid: this.cid, nid: this.nid}});
      }).catch(e => alert(e.message));
    }
  }

  highlighter(code: string) {
    return hljs.highlight(code, {language: 'html'}).value;
  }

  get note() {
    return Data.currentNote;
  }

  @Watch('nid', {immediate: true})
  onNIDChange() {
    if (!this.cid) return;
    let note = this.notes.find(n => n.nid === this.nid)
    if (!note) return this.$router.push({name: 'Collection', params: {cid: this.cid || ''}});
    Data.setCurrentNote(note);
  }

  @Watch('note', {immediate: true, deep: true})
  onNoteChange() {
    this.doc = "";
    if (!this.note) return;
    const req_url = `/raw/c/${encodeURIComponent(this.cid)}/notes/${encodeURIComponent(this.nid)}?${this.note.lastEdit}`
    fetch(req_url).then(res => res.text()).then(text => {
      if (!this.note) return;
      this.doc = text;
      if (this.note.type === "jupyter") this.notebook = JSON.parse(text);
      this.saved = true;
    });
  }

  @Watch('doc')
  @Watch('notebook', {deep: true})
  onContentChange() {
    this.saved = false;
  }

  beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    if (this.saved || window.confirm('Do you really want to leave? You may have unsaved changes!')) next()
    else next(false)
  }
}
</script>
<style>
.prism-editor-wrapper {
  font-family: monospace;
  padding: 5px;
}

.prism-editor__textarea:focus {
  outline: none;
}

.editor-window {
  height: calc(100vh - 48px - 24px) !important;
}
</style>