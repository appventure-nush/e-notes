<template>
  <div class="block-source" :class="{folded}">
    <div :class='{"block-light-selected":highlighted,"block-light":!highlighted}' @click="folded=!folded"/>
    <div style="width:calc(100% - 13px);">
      <div v-if="oldSrc===newSrc" style="overflow:auto">
      <pre style="min-width: 100%;" class="source-code-main hljs" :class="['language-'+language]"
           v-html="hljs"></pre>
      </div>
      <code-diff v-else :old-string="oldSrc" :new-string="newSrc"
                 :language="language"
                 :context="10"
                 :renderNothingWhenEmpty="renderNothingWhenEmpty"
                 :isShowNoChange="isShowNoChange"
                 :output-format="outputFormat"
                 :diff-style="diffStyle"/>
    </div>
  </div>
</template>

<script lang="ts">
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github.css'
import '@/styles/github-dark.scss';
import '@/styles/diff2html.dark.scss';

import {Component, Prop, Vue} from "vue-property-decorator";
import {Cell} from "@/types/shims/shims-nbformat-v4";
import QuizQuestion from "@/components/quiz/QuizQuestion.vue";
import {CodeDiff} from "v-code-diff";
import {normaliseJupyterOutput} from "@/mixins/helpers";

@Component({
  components: {
    QuizQuestion,
    CodeDiff
  }
})
export default class BlockSourceCompare extends Vue {
  name = "BlockSourceCompare"
  @Prop(Object) readonly oldCell?: Cell;
  @Prop(Object) readonly newCell?: Cell;
  @Prop(String) readonly outputFormat!: string;
  @Prop(String) readonly diffStyle!: string;
  @Prop(Boolean) readonly renderNothingWhenEmpty!: boolean;
  @Prop(Boolean) readonly isShowNoChange!: boolean;
  @Prop({type: Boolean, default: false}) highlighted!: boolean;
  folded = false;

  get hljs() {
    return hljs.highlight(this.oldSrc, {
      language: this.language,
      ignoreIllegals: true
    }).value;
  }

  get language() {
    return (this.newCell?.cell_type || this.oldCell?.cell_type) === 'markdown' ? 'markdown' : 'python';
  }

  get oldSrc() {
    return this.oldCell ? normaliseJupyterOutput(this.oldCell.source) : '';
  }

  get newSrc() {
    return this.newCell ? normaliseJupyterOutput(this.newCell.source) : '';
  }
}
</script>
<style scoped>
pre.hljs {
  border: solid thin #aaa5;
  border-radius: 5px;
  padding: 5px 10px;
}

.block-source.folded {
  max-height: 100px;
}

.block-source.folded pre.hljs {
  max-height: 100px;
  box-shadow: inset 0 -10px 10px -10px #999;
}
</style>