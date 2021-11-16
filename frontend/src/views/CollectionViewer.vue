<template>
  <v-container fluid style="min-height:100%">
    <router-view :loading="loading" :collection="coll"></router-view>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {cached, storeTo} from "@/store";

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
    cached("getCollection", this.cid).then(json => {
      this.$store.commit("setCurrentColl", json);
      this.loading = false;
    }).catch(e => {
      console.error(e);
      return this.$router.push("/");
    })
    cached("getCollectionRoles", this.cid).then(json => storeTo("setCurrentRoles", json));
    cached("getCollectionNotes", this.cid).then(json => storeTo("setCurrentNotes", json));
  }

  get coll() {
    return this.$store.state.currentCollection;
  }
}
</script>

<style scoped>

</style>