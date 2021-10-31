<template>
  <v-btn-toggle
      v-model="text"
      group>
    <v-btn value="left">
      Left
    </v-btn>

    <v-btn value="center">
      Center
    </v-btn>

    <v-btn value="right">
      Right
    </v-btn>

    <v-btn value="justify">
      Justify
    </v-btn>
  </v-btn-toggle>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class HomeAppbar extends Vue {
  name = "HomeAppbar"
  text = ""
}
</script>

<style scoped>

</style>