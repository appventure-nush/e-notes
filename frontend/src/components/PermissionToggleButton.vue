<template>
  <v-btn icon @click="toggle">
    <v-icon v-text="icon"></v-icon>
  </v-btn>
</template>
<script lang="ts">
import {Component, Vue, ModelSync} from "vue-property-decorator";

@Component
export default class PermissionToggleButton extends Vue {
  @ModelSync('change', 'value', {type: [Number, Boolean]}) perm!: number | boolean;

  toggle() {
    switch (this.perm) {
      case false:
      case 0b000:
        return this.perm = 0b001;
      case true:
      case 0b001:
        return this.perm = 0b011;
      case 0b010:
      case 0b011:
        return this.perm = 0b000
      default:
        return this.perm = 0b000
    }
  }

  get icon() {
    switch (this.perm) {
      case false:
      case 0b000:
        return "mdi-cancel"
      case true:
      case 0b001:
        return "mdi-book-open-page-variant"
      case 0b010:
      case 0b011:
        return "mdi-pencil"
      default:
        return "mdi-help"
    }
  }
}
</script>