<template>
  <v-row no-gutters>
    <v-col>
      <v-card flat tile :loading="loading" :disabled="loading">
        <h1 v-show="note.type==='jupyter'">Jupyter editor not implemented</h1>
        <markdown-editor v-if="note.type==='markdown'" ref="markdown" :options="mdoptions"
                         :class="{'toastui-editor-dark':$vuetify.theme.dark,'editor':true}"></markdown-editor>
        <prism-editor class="editor" v-show="!note.type||note.type==='html'" v-model="content"
                      :highlight="highlighter" line-numbers></prism-editor>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import {Note} from "@/types/note";
import {Editor} from '@toast-ui/vue-editor';
import {PrismEditor} from 'vue-prism-editor';
import hljs from 'highlight.js/lib/common';
import pretty from "pretty";

import 'vue-prism-editor/dist/prismeditor.min.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import '@/styles/github-dark.scss';
import {EventBus} from "@/event";
import {post} from "@/mixins/api";
import {cached, storeTo} from "@/store";

@Component({
  components: {
    'markdown-editor': Editor,
    PrismEditor
  }
})
export default class NoteEditor extends Vue {
  @Prop(String) readonly cid?: string;
  @Prop(String) readonly nid?: string;
  @Ref('markdown') readonly markdown!: Editor;
  name = "NoteEditor";
  doc?: any;
  loading = false;

  content = "";

  mdoptions = {
    height: "100%",
    maxHeight: "100%",
    usageStatistics: false,
    placeholder: 'Markdown input here you could'
  };

  mounted() {
    EventBus.$on('appbar-action', (action: string) => this.handle(action));
  }

  handle(action: string) {
    if (!this.cid || !this.nid) return;
    if (this.note.type === 'markdown' && !this.markdown) return;
    if (action === 'format') {
      if (this.note.type === 'jupyter') this.content = JSON.stringify(JSON.parse(this.content), null, 4);
      else if (this.note.type === 'markdown') this.markdown.invoke('setHTML', pretty(this.markdown.invoke('getHTML'), {ocd: true}));
      else this.content = pretty(this.content, {ocd: true});
    } else if (action === 'save') {
      this.loading = true;
      const formData = new FormData();
      if (this.note.type === 'jupyter') formData.append('note_source',
          new Blob([JSON.stringify(this.doc)], {type: 'application/x-ipynb+json'}), 'note_source.ipynb');
      else if (this.note.type === 'markdown') formData.append('note_source',
          new Blob([this.markdown.invoke('getMarkdown')], {type: 'text/markdown'}), 'note_source.md');
      else formData.append('note_source',
            new Blob([this.content], {type: 'text/html'}), 'note_source.html');
      post(`/api/collections/${this.cid}/notes/${this.nid}/upload`, formData).then(res => res.json()).then(json => {
        this.loading = false;
        if (json.status !== 'success') throw json.reason;
        this.$store.commit('setCurrentNote', json.note);
        cached("getCollectionNotes", this.cid).then((res: Note[]) => storeTo('setCurrentNotes', res));
        if (!this.cid || !this.nid) return;
        this.$router.push({name: 'Note', params: {cid: this.cid, nid: this.nid}});
      });
    }
  }

  highlighter(code: string) {
    return hljs.highlight(code, {language: 'html'}).value;
  }

  get note() {
    return this.$store.state.currentNote;
  }

  @Watch('nid', {immediate: true})
  onNoteChange() {
    this.doc = "";
    this.loading = true;
    cached("getCollectionNotes", this.cid).then((res: Note[]) => {
      storeTo('setCurrentNotes', res);
      return res.find(n => n.nid === this.nid);
    }).then(json => {
      if (!json) return this.$router.push({name: 'Collection', params: {cid: this.cid || ''}});
      storeTo("setCurrentNote", json);
      if (this.note.url) fetch(this.note.url).then(res => res.text()).then(text => {
        this.doc = this.note.type === "jupyter" ? JSON.parse(text) : text;
        if (this.note.type === "jupyter") return;
        else if (this.note.type === 'markdown') {
          this.markdown.invoke("setMarkdown", this.doc);
          this.markdown.invoke("moveCursorToStart");
        } else this.content = this.doc;
      }); else this.content = this.doc = "";
      this.loading = false;
    })
  }
}
</script>
<style>
.toastui-editor-dark .toastui-editor-defaultUI {
  border-color: #494c56;
  color: #eee;
}

.prism-editor-wrapper {
  font-family: monospace;
  padding: 5px;
}

.prism-editor__textarea:focus {
  outline: none;
}

.editor {
  height: calc(100vh - 64px - 24px) !important;
}
</style>