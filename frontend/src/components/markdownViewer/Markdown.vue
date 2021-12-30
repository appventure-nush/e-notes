<template>
  <div class="markdown-body" ref="markdown-it-vue-container">
  </div>
</template>
<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import MarkdownIt from 'markdown-it';
import MarkdownItKatex from '@traptitech/markdown-it-katex';
import MarkdownItTasklists from '@hedgedoc/markdown-it-task-lists';
import MarkdownItHighlightJS from "markdown-it-highlightjs";
import MarkdownItAttrs from "markdown-it-attrs";
import sanitizeHtml from 'sanitize-html';
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

// why not lol
if (Config.settings.animationCss) require('@/styles/animate.compat.css');

const SANITIZE_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'hr']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['id', 'class'],
    'img': ['border', 'width', 'height', 'align', 'src']
  }
};

@Component
export default class Markdown extends Vue {
  name = 'markdown-viewer';
  md!: MarkdownIt;
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


  @Watch('uwufy', {immediate: true})
  onUwufy() {
    this.onContentChange(this.content);
  }

  @Watch('content', {immediate: true})
  onContentChange(val: string) {
    this.$nextTick(() => {
      if (!val) return this.container.innerHTML = "";
      let html = this.md.render(val);
      if (this.sanitize) html = sanitizeHtml(html, SANITIZE_OPTIONS);
      this.container.innerHTML = html;
      if (EventBus.uwufy) modifyText(this.container, (str, i) => uwuifier.uwuifySentence(str, i), ['pre', 'code']);
    })
  }

  created() {
    this.md = new MarkdownIt(this.options.markdownIt || {})
        .use(MarkdownItAttrs, {})
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
  }

  get sanitize() {
    return !Config.settings.noSanitize;
  }

  get uwufy() {
    return EventBus.uwufy;
  }
}
</script>
<style>
.v-application.theme--dark.force-img-dark .markdown-body img {
  filter: invert(1) hue-rotate(180deg);
}
</style>
<style lang="scss" scoped>

::v-deep {
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }

  blockquote {
    background: #9991;
    border-left: 0.3em var(--v-primary-lighten1) solid;
    padding-left: 1em;
    border-left-width: 0.2em;
    margin: 1em 0;
  }

  p:not(table p), ul:not(table ul), ol:not(table ol) {
    margin-bottom: 1em;

    &:last-child {
      margin-bottom: 0 !important;
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