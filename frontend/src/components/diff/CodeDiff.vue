<template>
  <div ref="diff-container"></div>
</template>
<script lang="ts">
import {PropType} from "vue";
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import {createHtml, highlightElements, syncScroll} from './util'
import './styles/diff2html.dark.scss';
import './styles/style.scss'
import 'diff2html/bundles/css/diff2html.min.css'

@Component
export default class CodeDiff extends Vue {
  name = 'CodeDiff'
  @Ref('diff-container') container!: HTMLDivElement;
  @Prop({type: Boolean, default: true}) highlight!: boolean;
  @Prop({type: String, default: ''}) oldString!: string;
  @Prop({type: String, default: ''}) newString!: string;
  @Prop({type: Number, default: 10}) context!: number;
  @Prop({
    type: String as PropType<'line-by-line' | 'side-by-side'>,
    default: 'line-by-line'
  }) outputFormat!: 'line-by-line' | 'side-by-side';
  @Prop({type: Boolean, default: false}) drawFileList!: boolean;
  @Prop({type: Boolean, default: false}) renderNothingWhenEmpty!: boolean;
  @Prop({type: String as PropType<'word' | 'char'>, default: 'word'}) diffStyle!: 'word' | 'char';
  @Prop({type: String, default: ''}) fileName!: string;
  @Prop({type: Boolean, default: false}) isShowNoChange!: boolean;
  @Prop({type: Boolean, default: false}) trim!: boolean;
  @Prop({type: String, default: ''}) language!: string;
  @Prop({type: Boolean, default: false}) noDiffLineFeed!: boolean;

  timer = -1;

  @Watch('highlight')
  @Watch('oldString')
  @Watch('newString')
  @Watch('context')
  @Watch('outputFormat')
  @Watch('drawFileList')
  @Watch('renderNothingWhenEmpty')
  @Watch('diffStyle')
  @Watch('fileName')
  @Watch('isShowNoChange')
  @Watch('trim')
  @Watch('language')
  @Watch('noDiffLineFeed')
  onHighlightChange() {
    console.log("yue")
    clearTimeout(this.timer)
    this.timer = setTimeout(async () => {
      this.container.innerHTML = createHtml(this)
      if (this.highlight) await highlightElements(this.container, this);
    }, 200);
  }

  mounted() {
    this.container.innerHTML = createHtml(this);
    if (this.outputFormat === 'side-by-side') syncScroll(this.container, '.d2h-file-side-diff')
    if (this.highlight) highlightElements(this.container, this);
  }

  updated() {
    if (this.outputFormat === 'side-by-side') syncScroll(this.container, '.d2h-file-side-diff')
  }
}
</script>