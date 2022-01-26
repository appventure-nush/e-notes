<template>
  <div class="quiz rounded" :class="{submitted,wrong:!correct,correct}">
    <h3 v-text="def.Q" v-if="def.type==='mcq'||def.type==='mrq'"></h3>
    <v-radio-group v-if="def.type==='mcq'" v-model="buf" hide-details
                   :disabled="correct"
                   :readonly="viewOnly"
                   :append-icon="submitted?correct?'mdi-check':'mdi-close':undefined">
      <v-radio
          v-for="(n,i) in def.C"
          :key="i"
          :label="n.text"
          :value="i"
      ></v-radio>
    </v-radio-group>
    <div v-else-if="def.type==='mrq'">
      <v-checkbox
          v-model="buf"
          v-for="(n,i) in def.C"
          :key="i"

          :disabled="correct"
          :readonly="viewOnly"
          hide-details dense
          :label="n.text"
          :value="i"
      ></v-checkbox>
    </div>
    <v-text-field v-else-if="def.type==='text'" v-model="buf" :disabled="correct" hide-details="auto" filled
                  :label="def.Q"
                  :success="submitted&&correct"
                  :readonly="viewOnly"
                  :error="submitted&&!correct"></v-text-field>
    <v-btn class="mt-2" text v-if="!((submitted&&correct)||viewOnly)" @click="submit">Submit</v-btn>
  </div>
</template>

<script lang="ts">
import Config from "@/store/config";
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {QuizDef} from "./quiz";
import {equals} from "@/mixins/helpers";

@Component
export default class QuizQuestion extends Vue {
  name = "QuizQuestion"
  @Prop({type: Object}) def?: QuizDef;
  @Prop({type: Boolean, default: false}) viewOnly!: boolean;
  buf?: number | number[] | string | null = this.submittedAnswer || null;

  @Watch('def', {immediate: true, deep: true})
  onDefChange() {
    if (this.viewOnly) this.buf = this.correctAnswer;
    if (this.def?.type === 'mrq' && !Array.isArray(this.buf)) this.buf = [];
  }

  submit() {
    if (this.viewOnly) return;
    if (this.buf === -1) return;
    Config.setAnswer({key: this.key, ans: this.buf});
  }

  get submittedAnswer() {
    return this.viewOnly ? undefined : Config.quizAnswers[this.key];
  }

  get correct() {
    if (!this.def) return false;
    switch (this.def.type) {
      case 'mrq':
        return equals(
            this.def.C?.map((n, i) => ({i, correct: n.correct})).filter(n => n.correct).map(n => n.i) || [],
            this.submittedAnswer as number[]);
      case 'text':
        return this.def.A && this.submittedAnswer && this.def.A.toLowerCase() === String(this.submittedAnswer).toLowerCase();
      case 'mcq':
      default:
        return this.def.C && this.submitted && this.def.C[this.submittedAnswer as number]?.correct;
    }
  }

  get correctAnswer() {
    if (!this.def) return undefined;
    switch (this.def.type) {
      case 'mrq':
        return this.def.C?.map((n, i) => ({i, correct: n.correct})).filter(n => n.correct).map(n => n.i) || [];
      case 'text':
        return this.def.A;
      case 'mcq':
      default:
        return this.def.C && this.def.C.findIndex(c => c.correct);
    }
  }

  get submitted() {
    return !this.viewOnly
        && typeof this.submittedAnswer !== 'undefined';
  }

  get key() {
    return `${this.def?.Q}-${this.def?.A}-${this.def?.C?.length}`;
  }
}
</script>
<style>
.quiz {
  margin: 0.3em 0;
  padding: .5em 1em;
}

.quiz.submitted.wrong {
  background-color: rgba(150, 0, 0, 0.1);
}

.quiz.submitted.correct {
  background-color: rgba(0, 150, 0, 0.1);
}
</style>