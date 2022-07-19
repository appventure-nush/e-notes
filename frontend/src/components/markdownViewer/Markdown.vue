<template>
  <div class="markdown-body" ref="markdown-it-vue-container">
  </div>
</template>
<script lang="ts">
import {Component, Prop, PropSync, Ref, Vue, Watch} from "vue-property-decorator";
import MarkdownIt from 'markdown-it';
import MarkdownItKatex from '@traptitech/markdown-it-katex';
import MarkdownItTasklists from '@hedgedoc/markdown-it-task-lists';
import MarkdownItHighlightJS from "@/plugins/markdown-highlight-js";
import MarkdownItAttrs from "markdown-it-attrs";
import MarkdownItFrontMatters from "markdown-it-front-matter";
import sanitizeHtml from 'sanitize-html';
// @ts-ignore
import TOC from "markdown-it-table-of-contents";
import hljs from '@/plugins/hljs';
import {MarkdownItVueOptions} from "@/components/markdownViewer/markdown";
import 'katex/dist/katex.min.css'
import '@/plugins/hljs/hljs.scss';

import anchor from "markdown-it-anchor";
import Config from "@/store/config";
import {EventBus} from "@/event";
import {uwuifier} from "@/plugins/others";
import {modifyText} from "@/plugins/uwu/utils";
import {addPyScript} from "@/mixins/helpers";
// why not lol
if (Config.settings.animationCss) require('@/styles/animate.compat.css');

const SANITIZE_OPTIONS = {
  allowVulnerableTags: true,
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'hr', 'font', 'py-repl', 'py-script']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['id', 'class'],
    'span': ['style'],
    'font': ['size'],
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
  @PropSync('fms', {type: Array, default: () => []}) frontMatters!: string[];


  @Watch('uwufy')
  onUwufy() {
    this.onContentChange(this.content);
  }

  @Watch('content', {immediate: true})
  onContentChange(val: string) {
    this.$nextTick(() => {
      if (!val) return this.container.innerHTML = "";
      this.frontMatters.splice(0, this.frontMatters.length);
      let html = this.md.render(val);
      if (this.sanitize) html = sanitizeHtml(html, SANITIZE_OPTIONS);
      this.container.innerHTML = html;
      if (EventBus.uwufy) modifyText(this.container, (str, i) => uwuifier.uwuifySentence(str, i), ['pre', 'code']);

      if (val.includes('```pybox') || val.includes('```pyscript')) addPyScript()
    })
  }

  created() {
    this.md = new MarkdownIt(this.options.markdownIt || {})
        .use(MarkdownItFrontMatters, (fm: string) => this.frontMatters.push(fm))
        .use(MarkdownItAttrs, {})
        .use(MarkdownItKatex, this.options.katex || {})
        .use(MarkdownItTasklists, this.options.tasklists || {})
        .use(MarkdownItHighlightJS, this.options.highlight || {auto: false, hljs: hljs})
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
  py-repl {
    .parentBox {
      box-shadow: 0 0 0 1px #aaaa;
    }
  }

  py-script, py-repl {

    .parentBox {
      margin: 0.5em 0 !important;
    }

    .relative {
      position: relative;
    }

    .absolute {
      position: absolute
    }

    .right-1 {
      right: 0.5em
    }

    .bottom-1 {
      bottom: 0.5em
    }

    .opacity-0 {
      opacity: 0
    }

    &:hover #btnRun {
      opacity: 1;
    }

    .output {
      div {
        display: inline;
      }
    }

    &.dark {
      .ͼ2 .cm-gutters {
        background-color: #151515;
        color: #bbb;
        border-right: 1px solid #444;
      }

      .ͼ2 .cm-activeLineGutter {
        background-color: #232323;
      }

      .ͼ2 .cm-activeLine {
        background-color: #232323;
      }

      .ͼ4 .cm-line, .ͼ2 .cm-content {
        caret-color: white !important;
      }

      .ͼ2 .cm-selectionBackground {
        background: #333;
      }
    }
  }

  .code-exec-box {
    padding: 5px;
    box-shadow: 0 0 0 1px #aaaa;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  blockquote {
    background: #9991;
    border-left: 0.3em var(--v-primary-lighten1) solid;
    padding-left: 1em;
    border-left-width: 0.2em;
    margin: 1em 0;
  }

  p {
    margin-bottom: 0;
  }

  p:not(table p, li p), ul:not(table ul), ol:not(table ol) {
    margin-bottom: 1em;

    &:last-of-type {
      margin-bottom: 0 !important;
    }
  }

  li {
    margin-bottom: 0.2em;

    &:last-of-type {
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

  .katex {
    .accent {
      background-color: inherit !important;
      border-color: inherit !important;
    }
  }
}
</style>
