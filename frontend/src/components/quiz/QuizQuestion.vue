<template>
  <div class="quiz rounded" :class="{submitted,wrong:!correct,correct}">
    <h3 v-text="def.Q"></h3>
    <v-radio-group v-model="buf" :disabled="correct" hide-details
                   :append-icon="submitted?correct?'mdi-check':'mdi-close':undefined">
      <v-radio
          v-for="(n,i) in def.C"
          :key="i"
          :label="n"
          :value="i"
      ></v-radio>
    </v-radio-group>
    <v-btn class="ma-1" text v-if="!(submitted&&correct)" :disabled="correct" small @click="submit">Submit</v-btn>
  </div>
</template>

<script lang="ts">
import Config from "@/store/config";
import {Component, Prop, Vue} from "vue-property-decorator";
import {QuizDef} from "./quiz";

@Component
export default class QuizQuestion extends Vue {
  name = "QuizQuestion"
  @Prop({type: Object}) def!: QuizDef;
  buf = this.submittedAnswer;

  submit() {
    if (this.buf === -1) return;
    Config.setAnswer({key: this.key, ans: this.buf});
  }

  get submittedAnswer() {
    return Config.quizAnswers[this.key];
  }

  get correct() {
    return this.submittedAnswer === this.def.A;
  }

  get submitted() {
    return !isNaN(this.submittedAnswer);
  }

  get key() {
    return `${this.def.Q}-${this.def.A}-${this.def.C.length}`;
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