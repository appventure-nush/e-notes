<template>
  <div class="block-source" :class="{folded}">
    <div :class='{"block-light-selected":highlighted,"block-light":!highlighted}' @click="folded=!folded"/>
    <div style="width:calc(100% - 13px);">
      <code-diff :old-string="oldSrc" :new-string="newSrc"
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
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {Cell} from "@/types/shims/shims-nbformat-v4";
import QuizQuestion from "@/components/quiz/QuizQuestion.vue";
import CodeDiff from "@/components/diff/CodeDiff.vue";
import {normaliseJupyterOutput} from "@/mixins/helpers";

@Component({
  components: {
    QuizQuestion,
    CodeDiff
  }
})
export default class BlockSourceCompare extends Vue {
  name = "BlockSourceCompare"
  @Prop(Number) index!: number;
  @Prop(Array) hidden!: boolean[];
  @Prop(Object) readonly oldCell?: Cell;
  @Prop(Object) readonly newCell?: Cell;
  @Prop(String) readonly outputFormat!: string;
  @Prop(String) readonly diffStyle!: string;
  @Prop(Boolean) readonly renderNothingWhenEmpty!: boolean;
  @Prop(Boolean) readonly isShowNoChange!: boolean;
  @Prop({type: Boolean, default: false}) highlighted!: boolean;
  folded = false;

  @Watch('oldSrc')
  @Watch('newSrc', {immediate: true})
  update() {
    this.$set(this.hidden, this.index, this.oldSrc === this.newSrc);
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
.block-source.folded {
  max-height: 100px;
  box-shadow: inset 0 -10px 10px -10px #999;
}
</style>