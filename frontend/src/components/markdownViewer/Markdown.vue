<template>
  <div class="markdown-body" ref="markdown-it-vue-container"></div>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import MarkdownIt from 'markdown-it';
import MarkdownItKatex from '@traptitech/markdown-it-katex';
import MarkdownItTasklists from '@hedgedoc/markdown-it-task-lists';
import MarkdownItHighlightJS from "markdown-it-highlightjs";

// @ts-ignore
import TOC from "markdown-it-table-of-contents";

import {MarkdownItVueOptions} from "@/components/markdownViewer/markdown";
import 'katex/dist/katex.min.css'
import '@/styles/github-dark.scss';

import anchor from "markdown-it-anchor";
import Config from "@/store/config";
import {EventBus} from "@/event";
import {uwuifier} from "@/plugins/others";
import {modifyText} from "@/plugins/uwu/utils";

@Component
export default class Markdown extends Vue {
  name = 'markdown-viewer';
  md!: MarkdownIt;
  uwu = false;
  @Ref('markdown-it-vue-container') readonly container!: Element;
  @Prop(String) readonly content!: string;
  @Prop({
    type: Object,
    default: (): MarkdownItVueOptions => ({
      markdownIt: {
        html: !Config.settings.noHTML,
        linkify: !Config.settings.noLinkify,
        breaks: Config.settings.lineBreaks
      },
      katex: {}
    })
  }) readonly options!: MarkdownItVueOptions;

  @Watch('content', {immediate: true})
  onContentChange(val: string) {
    this.$nextTick(() => {
      if (!val) return this.container.innerHTML = "";
      this.container.innerHTML = this.md.render(val)
      if (this.uwu) modifyText(this.container, str => uwuifier.uwuifySentence(str));
    })
  }

  created() {
    this.md = new MarkdownIt(this.options.markdownIt || {})
        .use(MarkdownItKatex, this.options.katex || {})
        .use(MarkdownItTasklists, this.options.tasklists || {})
        .use(MarkdownItHighlightJS, this.options.highlight || {auto: false})
        .use(anchor, {
          permalink: anchor.permalink.ariaHidden({
            symbol: '<i aria-hidden="true" class="mdi mdi-link-variant perma-link"></i>',
            placement: 'after'
          })
        })
        .use(TOC, this.options.toc || {includeLevel: [1, 2, 3]});
    EventBus.$on("uwufy", this.uwufy)
  }

  destroyed() {
    EventBus.$off("uwufy", this.uwufy)
  }

  get() {
    return this.md;
  }

  uwufy() {
    this.uwu = true;
    this.onContentChange(this.content);
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  img {
    max-width: 100%;
  }

  blockquote {
    background: #9991;
    border-left: 0.3em var(--v-primary-lighten1) solid;
    padding-left: 1em;
    border-left-width: 0.2em;
    margin: 1em 0;
  }

  p:not(table p), ul:not(table ul), ol:not(table ol) {
    &:not(:last-child) {
      margin-bottom: 1em;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    &:not(:last-child) {
      padding-bottom: 0.3em;
    }

    a {
      text-decoration: none;
    }

    .perma-link {
      visibility: hidden;
    }

    &:hover .perma-link {
      visibility: visible;
    }
  }

  h1, h2, h3 {
    &::before {
      margin-left: -10px;
      margin-right: 0.5em;
      border-right: var(--v-primary-base) .08em solid;
      content: ''
    }
  }

  table {
    border-collapse: collapse;

    td {
      padding: 0.5em;
    }

    tr:nth-child(even) {
      background: var(--v-background-darken1);
    }
  }
}
</style>