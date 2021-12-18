<template>
  <div>
    <v-breadcrumbs dark :items="items" large v-if="$route.name!=='Edit Note'">
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item :to="item.route" exact>
          <span class="white--text">{{ item.text }}</span>
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>
    <NoteEditorAppbar v-else></NoteEditorAppbar>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import NoteEditorAppbar from "@/components/appbar/NoteEditorAppbar.vue";
import Data from "@/store/data";

@Component({
  components: {NoteEditorAppbar}
})
export default class CollectionAppbar extends Vue {
  name = "CollectionAppbar"
  text = 0

  get items() {
    return [{
      text: "Home",
      route: {
        name: "Home"
      }
    }, {
      text: Data.currentCollection?.cid,
      route: {
        name: "Collection",
        params: {cid: Data.currentCollection?.cid}
      }
    }, ...(this.$route.name !== 'Collection' ? [{
      text: Data.currentNote?.nid,
      route: {
        name: "Note",
        params: {cid: Data.currentNote?.cid, nid: Data.currentNote?.nid}
      }
    }] : [])]
  }
}
</script>

<style scoped>

</style>