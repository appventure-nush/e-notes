<template>
  <v-container>
    <template v-if="$route.name==='Collection'">
      <h1>{{ $store.state.currentCollection.name }}</h1>
      <h4>{{ $store.state.currentCollection.cid }}</h4>
    </template>
    <router-view></router-view>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {get} from "@/api/api";

@Component
export default class Collection extends Vue {
  @Prop(String) readonly cid?: string;
  name = "Collection";

  mounted() {
    get(`/api/collections/${this.cid}`).then(res => res.json()).then(json => {
      if (json.status && json.status !== "success") {
        console.log(json);
        return this.$router.push("/");
      }
      this.$store.commit("setCurrentColl", json);
    });
    get(`/api/collections/${this.cid}/notes`).then(res => res.json()).then(json => this.$store.commit("setCurrentNotes", json))
  }
}
</script>

<style scoped>

</style>