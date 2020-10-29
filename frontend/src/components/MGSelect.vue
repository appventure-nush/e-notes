<template>
  <div>
    <v-slider
      v-model="year"
      label="Year"
      max="6"
      min="1"
      step="1"
      thumb-label
      ticks="always"
    />
<!--    Use $emit to pass data to parent -->
    <v-autocomplete
      @input="$emit('update', $data.mentorGroup)"
      v-model="mentorGroup"
      label="Mentor group"
      :items="mentorGroups"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "MGSelect",
  data: function () {
    return {
      year: 1,
      mentorGroup:"",
    };
  },
  computed: {
    mentorGroups() {
      const out = [];
      for (let i = 1; i < (this.$data.year > 2 ? 8 : 7); i++) {
        out.push(`${this.$data.year}0${i}`)
      }
      return out;
    }
  }
});
</script>
