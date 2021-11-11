<template>
  <v-row class="px-5">
    <v-col>
      <CollectionPopup v-if="canCreate()">
        <template v-slot:activator="{on}">
          <v-btn text v-on="on">
            New
          </v-btn>
        </template>
      </CollectionPopup>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import CollectionPopup from "@/components/CollectionPopup.vue";

@Component({
  components: {CollectionPopup}
})
export default class HomeAppbar extends Vue {
  name = "HomeAppbar"
}
</script>

<style scoped>

</style>