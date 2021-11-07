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
import NoteEditorAppbar from "@/components/NoteEditorAppbar.vue";

@Component({
  components: {NoteEditorAppbar}
})
export default class CollectionAppbar extends Vue {
  name = "CollectionAppbar"
  text = 0

  edit() {
    alert("Edit");
  }

  get items() {
    return [{
      text: "Home",
      route: {
        name: "Home"
      }
    }, {
      text: this.$store.state.currentCollection.name,
      route: {
        name: "CollectionViewer.vue",
        params: {cid: this.$store.state.currentCollection.cid}
      }
    }, ...(this.$route.name !== 'CollectionViewer.vue' ? [{
      text: this.$store.state.currentNote.name,
      route: {
        name: "NoteViewer.vue",
        params: {cid: this.$store.state.currentNote.cid, nid: this.$store.state.currentNote.nid}
      }
    }] : [])]
  }
}
</script>

<style scoped>

</style>