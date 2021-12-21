<template>
  <v-container>
    <v-row v-if="colls&&colls.filter">
      <collection-display v-model="colls[i]" v-for="(coll,i) in colls" :key="coll.cid"/>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import CollectionDisplay from "@/components/CollectionDisplay.vue";
import Data from "@/store/data"
import Config from "@/store/config"

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

  get pinnedCollections() {
    return Config.settings.pinnedCollections || []
  }

  get colls() {
    return (Data.collections || []).sort((a, b) => {
      return this.pinnedCollections.includes(a.cid) && this.pinnedCollections.includes(b.cid) ? a.cid.localeCompare(b.cid) :
          this.pinnedCollections.includes(a.cid) ? -1 :
              this.pinnedCollections.includes(b.cid) ? 1 :
                  a.cid.localeCompare(b.cid);
    });
  }
}
</script>
