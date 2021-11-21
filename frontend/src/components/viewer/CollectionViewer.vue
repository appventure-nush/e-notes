<template>
  <v-container fluid style="min-height:100%">
    <router-view :loading="loading" :notes="notes"></router-view>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import Data from "@/store/data"

@Component
export default class CollectionViewer extends Vue {
  @Prop(String) readonly cid?: string;
  name = "CollectionViewer";
  loading = false;

  @Watch('cid', {immediate: true})
  onCIDChange() {
    if (!this.cid) return;
    this.loading = true;
    Data.fetchNotes(this.cid);
    Data.fetchRoles();
  }

  get notes() {
    return this.cid ? Data.notes[this.cid] : [];
  }
}
</script>

<style scoped>

</style>