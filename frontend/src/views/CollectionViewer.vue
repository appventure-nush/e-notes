<template>
  <v-container fluid style="min-height:100%">
    <router-view :loading="loading" :collection="coll"></router-view>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

@Component
export default class CollectionViewer extends Vue {
  @Prop(String) readonly cid?: string;
  name = "CollectionViewer";
  loading = false;

  @Watch('cid', {immediate: true})
  onCIDChange() {
    this.loading = true;
    this.$store.commit("setCurrentRoles", [])
    this.$store.commit("setCurrentNotes", [])
    this.$store.commit("setCurrentColl", {})
    this.$store.cache.dispatch("getCollection", this.cid).then(json => {
      if (json.status && json.status !== "success") {
        this.$store.cache.delete("getCollection", this.cid);
        return this.$router.push("/");
      }
      this.$store.commit("setCurrentColl", json);
      this.loading = false;
    });
    this.$store.cache.dispatch("getCollectionRoles", this.cid).then(json => this.$store.commit("setCurrentRoles", json));
    this.$store.cache.dispatch("getCollectionNotes", this.cid).then(json => this.$store.commit("setCurrentNotes", json));
  }

  get coll() {
    return this.$store.state.currentCollection;
  }
}
</script>

<style scoped>

</style>