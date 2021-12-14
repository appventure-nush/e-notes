<template>
  <div style="max-height: 100%;max-width: 100%;overflow-y: auto">
    <div class="d-flex" style="max-width: 100%">
      <prism-editor class="flex-grow-1 ma-1 markdown-editor" v-model="markdown" :highlight="highlighter"></prism-editor>
      <markdown class="flex-grow-1 ma-1 markdown-display" :content="displayedMarkdown"></markdown>
    </div>
  </div>
</template>

<script lang="ts">
import {Watch, Component, ModelSync, Vue} from "vue-property-decorator";
import Markdown from "@/components/markdownViewer/Markdown.vue";
import {PrismEditor} from 'vue-prism-editor';
import hljs from 'highlight.js/lib/common';
import 'vue-prism-editor/dist/prismeditor.min.css';

@Component({
  components: {
    PrismEditor, Markdown
  }
})
export default class MarkdownEditor extends Vue {
  name = "MarkdownEditor"
  displayedMarkdown = ""
  @ModelSync('change', 'value', {type: String}) markdown!: string;

  @Watch('markdown', {immediate: true})
  onContentChange() {
    setTimeout(() => this.displayedMarkdown = this.markdown, 0);
  }

  highlighter(code: string) {
    return hljs.highlight(code, {language: 'markdown'}).value;
  }
}
</script>

<style scoped>
.markdown-editor {
  max-width: 50%;
  font-family: monospace;
}

.markdown-display {
  max-width: 50%;
  width: 50%;
  height: auto;
}

>>> .markdown-display > * {
  max-width: 100% !important;
  word-break: normal;
  overflow-wrap: anywhere;
  overflow-x: auto;
}
</style>