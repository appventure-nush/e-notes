<template>
  <div class="block-source">
    <div :class='{"block-light-selected":highlighted,"block-light":!highlighted}'/>
    <v-row no-gutters class="cell-row">
      <v-col class="flex-grow-0">
        <pre class="cell-header source" v-text="cell.execution_count?`In [${cell.execution_count}]: `:''"></pre>
      </v-col>
      <v-col :style="{'min-width':$vuetify.breakpoint.xsOnly?'100%':'0'}">
        <prism-editor class="editor" v-model="source" :highlight="highlighter"></prism-editor>
      </v-col>
      <v-divider class="hidden-sm-and-up my-1" style="min-width:100%;"></v-divider>
      <v-col :style="{'min-width':$vuetify.breakpoint.xsOnly?'100%':'0'}" v-if="type==='markdown'">
        <markdown :fms="fms" :content="source"></markdown>
        <QuizQuestion v-for="(f,i) in parsedFM" :def="f" :key="i" view-only></QuizQuestion>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {Component, Prop, VModel, Vue} from "vue-property-decorator";
import {PrismEditor} from 'vue-prism-editor';
import hljs from '@/plugins/hljs';
import {Cell} from "@/types/shims/shims-nbformat-v4";
import Markdown from "@/components/markdownViewer/Markdown.vue";

import 'vue-prism-editor/dist/prismeditor.min.css';
import {denormaliseJupyterOutput, normaliseJupyterOutput} from "@/mixins/helpers";
import QuizQuestion from "@/components/quiz/QuizQuestion.vue";
import {parseQuiz} from "../quiz/quiz";

@Component({
  components: {
    QuizQuestion,
    PrismEditor,
    Markdown
  }
})
export default class BlockSourceEditor extends Vue {
  name = "BlockSourceEditor"
  @VModel({type: Object}) readonly cell!: Cell;
  @Prop(Boolean) readonly display!: boolean;
  @Prop(Boolean) readonly showLineNumber!: boolean;
  @Prop(String) readonly language!: string;
  @Prop({type: Boolean, default: false}) highlighted!: boolean;

  fms: string[] = [];

  get hide() {
    return !this.display && this.cell.metadata.jupyter !== undefined && this.cell.metadata.jupyter.source_hidden
  }

  highlighter(code: string) {
    return hljs.highlight(code, {language: this.type === 'markdown' ? 'markdown' : this.language}).value;
  }

  get type() {
    return this.cell.cell_type;
  }

  get source() {
    return normaliseJupyterOutput(this.cell.source)
  }

  set source(src: string) {
    this.cell.source = denormaliseJupyterOutput(src);
  }

  get parsedFM() {
    return this.fms.map(str => {
      try {
        return parseQuiz(str);
      } catch (e) {
        return null;
      }
    }).filter(Boolean)[0] || [];
  }
}
</script>
<style>
img {
  padding: 0.3em;
}
</style>