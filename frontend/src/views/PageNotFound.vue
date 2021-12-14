<template>
  <v-container>
    <h1>404 Not Found</h1>
    <v-btn outlined color="success" to="/">Back to Home</v-btn>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class PageNotFound extends Vue {
  name = "PageNotFound"
}
</script>

<style scoped>

</style>