<template>
  <div>
    <div v-if="$route.name==='Collection'">
      <v-row class="mx-2">
        <v-col>
          <v-btn @click="edit" outlined>Edit Collection</v-btn>
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <v-row class="mx-2">
        <v-col>
          <v-btn @click="edit" outlined>Edit Note</v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class CollectionAppbar extends Vue {
  name = "CollectionAppbar"
  text = 0

  edit() {
    alert("Edit");
  }
}
</script>

<style scoped>

</style>