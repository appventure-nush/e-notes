<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" lg="4" v-for="(coll,i) in $store.state.collections" :key="coll.cid">
        <collection-display v-model="$store.state.collections[i]"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {get} from "@/api/api";
import CollectionDisplay from "@/components/CollectionDisplay.vue";

@Component({
  components: {
    'collection-display': CollectionDisplay
  }
})
export default class Home extends Vue {
  name = 'Home'

  mounted() {
    this.$store.cache.dispatch("getCollections").then(json => this.$store.commit("collections", json))
  }
}
</script>
