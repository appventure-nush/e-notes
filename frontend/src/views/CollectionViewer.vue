<template>
  <v-container fluid style="min-height:100%">
    <router-view :loading="loading"></router-view>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

@Component
export default class CollectionViewer extends Vue {
  @Prop(String) readonly cid?: string;
  name = "CollectionViewer";
  loading = false

  @Watch('cid')
  onCIDChange() {
    this.loading = true;
    this.$store.commit("setCurrentRoles", [])
    this.$store.commit("setCurrentNotes", [])
    this.$store.commit("setCurrentColl", {})
    this.$store.cache.dispatch("getCollection", this.cid).then(json => {
      if (json.status && json.status !== "success") {
        return this.$router.push("/");
      }
      this.loading = false;
      this.$store.commit("setCurrentColl", json);
    });
    this.$store.cache.dispatch("getCollectionRoles", this.cid).then(json => this.$store.commit("setCurrentRoles", json));
    this.$store.cache.dispatch("getCollectionNotes", this.cid).then(json => this.$store.commit("setCurrentNotes", json));
  }
}
</script>

<style scoped>

</style>