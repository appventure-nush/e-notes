<template>
  <v-container fluid style="min-height:100%">
    <router-view :loading="loading" :collection="coll"></router-view>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {Collection} from "@/types/coll";

@Component
export default class CollectionViewer extends Vue {
  @Prop(String) readonly cid?: string;
  name = "CollectionViewer";
  loading = false;
  coll: Collection = {} as Collection;

  @Watch('cid')
  onCIDChange() {
    this.loading = true;
    this.$store.commit("setCurrentRoles", [])
    this.$store.commit("setCurrentNotes", [])
    this.$store.commit("setCurrentColl", this.coll = {} as Collection)
    this.$store.cache.dispatch("getCollection", this.cid).then(json => {
      if (json.status && json.status !== "success") {
        this.$store.cache.delete("getCollection", this.cid);
        return this.$router.push("/");
      }
      this.$store.commit("setCurrentColl", this.coll = json as Collection);
      this.loading = false;
    });
    this.$store.cache.dispatch("getCollectionRoles", this.cid).then(json => this.$store.commit("setCurrentRoles", json));
    this.$store.cache.dispatch("getCollectionNotes", this.cid).then(json => this.$store.commit("setCurrentNotes", json));
  }

  mounted() {
    this.onCIDChange();
  }
}
</script>

<style scoped>

</style>