<template>
  <div class="markdown-body" ref="markdown-it-vue-container"></div>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import MarkdownIt from 'markdown-it'
import MarkdownItKatex from '@traptitech/markdown-it-katex'
import MarkdownItTasklists from '@hedgedoc/markdown-it-task-lists'
import {MarkdownItVueOptions} from "@/components/markdownViewer/markdown";
import 'katex/dist/katex.min.css'
import '@/styles/github-dark.scss';

const DEFAULT_OPTIONS_KATEX = {throwOnError: false, errorColor: '#cc0000'}
const DEFAULT_OPTIONS_TASKLISTS = {}
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
      katex: DEFAULT_OPTIONS_KATEX,
      tasklists: DEFAULT_OPTIONS_TASKLISTS
    }
  }) readonly options!: MarkdownItVueOptions;

  @Watch('content', {immediate: true})
  onContentChange(val: string) {
    this.$nextTick(() => {
      this.container.innerHTML = this.md.render(val)
    })
  }

  created() {
    this.md = new MarkdownIt(this.options.markdownIt).use(MarkdownItKatex, this.options.katex || DEFAULT_OPTIONS_KATEX).use(MarkdownItTasklists, this.options.tasklists || DEFAULT_OPTIONS_TASKLISTS)
  }

  get() {
    return this.md;
  }
}
</script>