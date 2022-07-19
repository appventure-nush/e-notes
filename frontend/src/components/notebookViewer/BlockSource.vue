<template>
  <div class="block-source">
    <div :class='{"block-light-selected":highlighted,"block-light":!highlighted}'/>
    <div class="block-hidden" v-if="hide"/>
    <v-row v-else no-gutters class="cell-row">
      <v-col class="flex-grow-0">
        <pre class="cell-header source" v-text="cell.execution_count?`In [${cell.execution_count}]: `:''"></pre>
      </v-col>
      <v-col :style="{'min-width':$vuetify.breakpoint.xsOnly?'100%':'0'}">
        <v-card class="cell-content source-code" v-if="type==='code'" flat outlined>
          <pre ref="hljs" class="source-code-main hljs" :class="['language-'+language]" v-html="hljs"></pre>
        </v-card>
        <div class="cell-content source-markdown" v-else-if="type==='markdown'">
          <markdown :fms="fms" :content="cell.source.join('')"></markdown>
          <QuizQuestion v-for="(f,i) in parsedFM" :def="f" :key="i"></QuizQuestion>
        </div>
        <div v-else>
          Cell Type {{ type }} not supported...
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import hljs from '@/plugins/hljs';
import {Cell} from "@/types/shims/shims-nbformat-v4";
import {normaliseJupyterOutput} from "@/mixins/helpers";
import QuizQuestion from "@/components/quiz/QuizQuestion.vue";
import {parseQuiz} from "../quiz/quiz";
import {lineNumbersBlock} from "@/plugins/hljs/hljs-line-number";

@Component({
  components: {
    QuizQuestion,
    Markdown: () => import(/* webpackChunkName: "markdown" */"@/components/markdownViewer/Markdown.vue")
  }
})
export default class BlockSource extends Vue {
  name = "BlockSource"
  @Prop(Object) readonly cell!: Cell;
  @Prop(Boolean) readonly display!: boolean;
  @Prop(Boolean) readonly showLineNumber!: boolean;
  @Prop(String) readonly language!: string;
  @Prop({type: Boolean, default: false}) highlighted!: boolean;
  fms: string[] = [];

  mounted() {
    if (this.$refs.hljs) lineNumbersBlock(this.$refs.hljs as Element, {singleLine: false, startFrom: 1})
  }

  updated() {
    if (this.$refs.hljs) lineNumbersBlock(this.$refs.hljs as Element, {singleLine: false, startFrom: 1})
  }

  get hljs() {
    return hljs.highlight(normaliseJupyterOutput(this.cell.source), {
      language: this.language,
      ignoreIllegals: true
    }).value;
  }

  get hide() {
    return !this.display && this.cell.metadata.jupyter !== undefined && this.cell.metadata.jupyter.source_hidden
  }

  get type() {
    return this.cell.cell_type;
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
