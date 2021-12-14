<template>
  <v-container>
    <v-row v-if="colls&&colls.filter">
      <v-col cols="12" sm="6" lg="4" v-for="(coll,i) in colls" :key="coll.cid">
        <collection-display v-model="colls[i]"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import CollectionDisplay from "@/components/CollectionDisplay.vue";
import Data from "@/store/data"

@Component({
  components: {
    'collection-display': CollectionDisplay
  }
})
export default class Home extends Vue {
  name = 'Home'

  created() {
    Data.fetchCollections();
  }

  get colls() {
    return Data.collections;
  }
}
</script>
