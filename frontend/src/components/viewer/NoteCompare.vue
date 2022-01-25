<template>
  <div>
    <h4>
      Comparing {{ this.old }} to {{ this.new }}
    </h4>
    <div class="d-flex justify-end">
      <!--      <v-checkbox hint="Show code" prepend-icon="mdi-format-page-split" v-model="isShowNoChange" dense-->
      <!--                  hide-details="auto"></v-checkbox>-->
      <!--      <v-checkbox hint="Hide empty changes" prepend-icon="mdi-format-page-split" v-model="renderNothingWhenEmpty" dense-->
      <!--                  hide-details="auto"></v-checkbox>-->
      <v-checkbox hint="Split view" prepend-icon="mdi-format-page-split" v-model="split" dense
                  hide-details="auto"></v-checkbox>
      <v-checkbox hint="Word/char" prepend-icon="mdi-format-letter-matches" v-model="word" class="ml-2" dense
                  hide-details="auto"></v-checkbox>
    </div>
    <div v-if="!doc_loading">
      <code-diff v-if="errorJSON" fileName="raw (json error)"
                 :old-string="typeof oldDoc==='object'?JSON.stringify(oldDoc):oldDoc"
                 :new-string="typeof newDoc==='object'?JSON.stringify(newDoc):newDoc"
                 :renderNothingWhenEmpty="renderNothingWhenEmpty"
                 :isShowNoChange="isShowNoChange"
                 :context="10"
                 :output-format="format"
                 :diff-style="diff"/>
      <JupyterCompare v-else-if="note.type==='jupyter'&&validJupyter" :old-notebook="oldDoc" :new-notebook="newDoc"
                      :renderNothingWhenEmpty="renderNothingWhenEmpty"
                      :isShowNoChange="isShowNoChange"
                      :output-format="format"
                      :diff-style="diff"></JupyterCompare>
      <code-diff v-else-if="note.type==='markdown'"
                 :file-name="note.name"
                 :old-string="oldDoc" :new-string="newDoc" :context="10"
                 :renderNothingWhenEmpty="renderNothingWhenEmpty"
                 :isShowNoChange="isShowNoChange"
                 :output-format="format"
                 :diff-style="diff"/>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {Note} from "@/types/note";
import Data from "@/store/data";
import CodeDiff from 'vue-code-diff'
import JupyterCompare from "@/components/notebookViewer/JupyterCompare.vue";

@Component({
  components: {
    JupyterCompare,
    CodeDiff
  }
})
export default class NoteCompare extends Vue {
  @Prop(String) readonly cid!: string;
  @Prop(String) readonly nid!: string;
  @Prop(Number) readonly old!: number;
  @Prop(Number) readonly new!: number;
  @Prop(Array) readonly notes!: Note[];

  oldDoc?: any = "";
  newDoc?: any = "";

  errorJSON = false;
  doc_loading = false;

  isShowNoChange = false;
  renderNothingWhenEmpty = true;
  split = true;
  word = true;

  @Watch('nid', {immediate: true})
  onNIDChange() {
    window.scrollTo(0, 0);
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

  lastOldUrl?: string;
  lastNewUrl?: string;

  @Watch('old')
  @Watch('new', {immediate: true})
  onNoteChanged() {
    this.doc_loading = true;
    this.newDoc = this.oldDoc = "";
    let oldUrl = `/raw/c/${encodeURIComponent(this.cid)}/notes/${encodeURIComponent(this.nid)}/${this.old}`;
    let newUrl = `/raw/c/${encodeURIComponent(this.cid)}/notes/${encodeURIComponent(this.nid)}/${this.new}`;
    this.errorJSON = false;
    Promise.all([this.lastOldUrl === oldUrl ? null : fetch(oldUrl).then(res => res.text()).then(text => {
      if (!this.note) return;
      try {
        this.oldDoc = this.note.type === "jupyter" ? JSON.parse(text) : text;
      } catch (e) {
        this.errorJSON = true;
        this.oldDoc = text;
      }
    }), this.lastNewUrl === newUrl ? null : fetch(newUrl).then(res => res.text()).then(text => {
      if (!this.note) return;
      try {
        this.newDoc = this.note.type === "jupyter" ? JSON.parse(text) : text;
      } catch (e) {
        this.errorJSON = true;
        this.newDoc = text;
      }
    })]).finally(() => {
      this.doc_loading = false;
    })

  }

  get note(): Note {
    return Data.currentNote || {} as Note;
  }

  get format() {
    return this.split ? 'side-by-side' : 'line-by-line';
  }

  get validJupyter() {
    return typeof this.newDoc === "object" && typeof this.oldDoc === "object";
  }

  get diff() {
    return this.word ? 'word' : 'char';
  }
}
</script>
<style>
.d2h-wrapper .d2h-code-side-line,
.d2h-wrapper .d2h-code-line {
  display: inline-block;
  width: auto;
}

code {
  padding: 0 0 !important;
}
</style>