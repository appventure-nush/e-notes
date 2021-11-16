<template>
  <v-container>
    <v-row v-if="$store.state.collections&&$store.state.collections.filter">
      <v-col cols="12" sm="6" lg="4" v-for="(coll,i) in $store.state.collections" :key="coll.cid">
        <collection-display v-model="$store.state.collections[i]"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import CollectionDisplay from "@/components/CollectionDisplay.vue";
import {cached, storeTo} from "@/store";

@Component({
  components: {
    'collection-display': CollectionDisplay
  }
})
export default class Home extends Vue {
  name = 'Home'

  mounted() {
    cached("getCollections").then(json => storeTo("collections", json))
  }
}
</script>
