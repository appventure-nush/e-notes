<template>
  <v-btn text @click="newRole" v-if="isAdmin()" class="mx-2">
    New
  </v-btn>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import CollectionPopup from "@/components/popup/CollectionPopup.vue";
import {EventBus} from "@/event";

@Component({
  components: {CollectionPopup}
})
export default class HomeAppbar extends Vue {
  name = "HomeAppbar"

  newRole() {
    EventBus.$emit('newRoleRequested');
  }
}
</script>

<style scoped>

</style>