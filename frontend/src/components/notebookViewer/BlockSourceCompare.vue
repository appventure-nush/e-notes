<template>
  <div class="block-source">
    <div :class='{"block-light-selected":highlighted,"block-light":!highlighted}'/>
    <div style="width:100%">
      <code-diff :old-string="oldCell?oldCell.source.join(''):''" :new-string="newCell?newCell.source.join(''):''"
                 :context="10"
                 :renderNothingWhenEmpty="renderNothingWhenEmpty"
                 :isShowNoChange="isShowNoChange"
                 :output-format="outputFormat"
                 :diff-style="diffStyle"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Cell} from "@/types/shims/shims-nbformat-v4";
import QuizQuestion from "@/components/quiz/QuizQuestion.vue";
import {CodeDiff} from "v-code-diff";

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
}
</script>