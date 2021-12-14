<template>
  <v-card flat tile :loading="loading" :disabled="loading" class="editor-window">
    <h1 v-show="note.type==='jupyter'">Jupyter editor not implemented</h1>
    <markdown-editor v-if="note.type==='markdown'" v-model="content"></markdown-editor>
    <prism-editor class="editor" v-show="!note.type||note.type==='html'" v-model="content" :highlight="highlighter"
                  line-numbers></prism-editor>
  </v-card>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {Note} from "@/types/note";
import {PrismEditor} from 'vue-prism-editor';
import hljs from 'highlight.js/lib/common';
import pretty from "pretty";

import 'vue-prism-editor/dist/prismeditor.min.css';
import '@/styles/github-dark.scss';
import {EventBus} from "@/event";
import {post} from "@/mixins/api";
import Data from "@/store/data"
import Config from "@/store/config"
import MarkdownEditor from "@/components/MarkdownEditor.vue";

@Component({
  components: {
    PrismEditor,
    MarkdownEditor
  }
})
export default class NoteEditor extends Vue {
  @Prop(String) readonly cid?: string;
  @Prop(String) readonly nid?: string;
  @Prop(Array) readonly notes!: Note[];
  name = "NoteEditor";
  doc?: any;
  loading = false;

  content = "";

  created() {
    EventBus.$on('appbar-action', (action: string) => this.handle(action));
  }

  handle(action: string) {
    if (!this.cid || !this.nid) return;
    if (!this.note) return;
    if (action === 'format') {
      if (this.note.type === 'jupyter') this.content = JSON.stringify(JSON.parse(this.content), null, 4);
      // else if (this.note.type === 'markdown') this.markdown.invoke('setHTML', pretty(this.markdown.invoke('getHTML'), {ocd: true}));
      else this.content = pretty(this.content, {ocd: true});
    } else if (action === 'save') {
      this.loading = true;

      const formData = new FormData();
      if (this.note.type === 'jupyter') formData.append('note_source',
          new Blob([JSON.stringify(this.doc)], {type: 'application/x-ipynb+json'}), 'note_source.ipynb');
      else if (this.note.type === 'markdown') formData.append('note_source',
          new Blob([this.content], {type: 'text/markdown'}), 'note_source.md');
      else formData.append('note_source',
            new Blob([this.content], {type: 'text/html'}), 'note_source.html');
      if (!this.cid) return;
      post<{ note: Note }>(`/api/collections/${this.cid}/notes/${this.nid}/upload`, formData).then(() => {
        this.loading = false;
        if (!this.cid) return;
        Data.fetchNotes(this.cid);
        if (!this.cid || !this.nid) return;
        this.$router.push({name: 'Note', params: {cid: this.cid, nid: this.nid}});
      });
    }
  }

  highlighter(code: string) {
    return hljs.highlight(code, {language: 'html'}).value;
  }

  get note() {
    return Data.currentNote;
  }

  get dark() {
    return Config.dark;
  }

  @Watch('nid', {immediate: true})
  onNoteChange() {
    this.doc = "";
    if (!this.cid) return;
    let note = this.notes.find(n => n.nid === this.nid)
    if (!note) return this.$router.push({name: 'Collection', params: {cid: this.cid || ''}});
    Data.setCurrentNote(note);
    if (note.url) fetch(note.url).then(res => res.text()).then(text => {
      if (!note) return;
      this.doc = note.type === "jupyter" ? JSON.parse(text) : text;
      if (note.type === "jupyter") return;
      else if (note.type === 'markdown') {
        this.content = this.doc;
      } else this.content = this.doc;
    }); else this.content = this.doc = "";
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
  height: calc(100vh - 64px - 24px) !important;
}
</style>