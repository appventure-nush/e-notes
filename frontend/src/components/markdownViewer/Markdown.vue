<template>
  <div class="markdown-body" ref="markdown-it-vue-container"></div>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import MarkdownIt from 'markdown-it'
import MarkdownItKatex from '@traptitech/markdown-it-katex'
import MarkdownItTasklists from '@hedgedoc/markdown-it-task-lists'
import markdown_it_highlightjs from "markdown-it-highlightjs";
import {HighlightOptions, KatexOptions, MarkdownItVueOptions} from "@/components/markdownViewer/markdown";
import 'katex/dist/katex.min.css'
import '@/styles/github-dark.scss';

const DEFAULT_OPTIONS_KATEX: KatexOptions = {blockClass: "test"}
const DEFAULT_OPTIONS_HIGHLIGHT: HighlightOptions = {inline: true, auto: false}
@Component
export default class Markdown extends Vue {
  name = 'markdown-viewer';
  md!: MarkdownIt;
  @Ref('markdown-it-vue-container') readonly container!: Element;
  @Prop(String) readonly content!: string;
  @Prop({
    default: {
      markdownIt: {
        linkify: true
      },
      katex: DEFAULT_OPTIONS_KATEX
    }
  }) readonly options!: MarkdownItVueOptions;

  @Watch('content', {immediate: true})
  onContentChange(val: string) {
    this.$nextTick(() => {
      if (!val) return this.container.innerHTML = "";
      this.container.innerHTML = this.md.render(val)
    })
  }

  created() {
    this.md = new MarkdownIt(this.options.markdownIt)
        .use(MarkdownItKatex, this.options.katex || DEFAULT_OPTIONS_KATEX)
        .use(MarkdownItTasklists, this.options.tasklists || {})
        .use(markdown_it_highlightjs, this.options.highlight || DEFAULT_OPTIONS_HIGHLIGHT)
  }

  get() {
    return this.md;
  }
}
</script>
<style lang="scss">
blockquote {
  border-left: 0.3em var(--v-primary-lighten1) solid;
  padding-left: 1em;
  border-left-width: 0.2em;
  margin: 1em 0;
}

p:not(table p), ul:not(table ul), ol:not(table ol) {
  &:not(:last-child) {
    padding-bottom: 1em;
  }
}

h1, h2, h3, h4, h5, h6 {
  &:not(:last-child) {
    padding-bottom: 0.3em;
  }
}
</style>