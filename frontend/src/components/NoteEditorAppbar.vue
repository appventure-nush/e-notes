<template>
  <v-row class="px-5">
    <v-col>
      <v-btn text @click="save">
        Save
      </v-btn>
    </v-col>
    <v-col>
      <v-btn text @click="format">
        Format
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {EventBus} from "@/event";

@Component
export default class NoteEditorAppbar extends Vue {
  name = "NoteEditorAppbar"

  save() {
    EventBus.$emit('appbar-action', 'save');
  }

  format() {
    EventBus.$emit('appbar-action', 'format');
  }
}
</script>