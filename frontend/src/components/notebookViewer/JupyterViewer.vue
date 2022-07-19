<template>
  <div class="jupyter-viewer">
    <div class="block d-flex justify-end">
      <v-checkbox hint="Show plaintext" prepend-icon="mdi-format-clear" v-model="plain" dense
                  hide-details="auto"></v-checkbox>
      <v-checkbox hint="Show media" prepend-icon="mdi-image" v-model="graphic" class="ml-2" dense
                  hide-details="auto"></v-checkbox>
    </div>
    <div
        class="block" :class="{selected:clickCellIndex === index}"
        v-for="(cell, index) in notebook.cells"
        :key="index"
        @mousedown="clickCellIndex = index">
      <BlockSource
          v-if="'cell_type' in cell"
          :cell="cell"
          :language="language"
          :highlighted="clickCellIndex === index"/>
      <BlockOutput
          v-if="'outputs' in cell"
          :graphic="graphic"
          :plain="plain"
          :cell="cell"
          :highlighted="clickCellIndex === index"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Notebook} from "@/types/shims/shims-nbformat-v4";
import BlockSource from "@/components/notebookViewer/BlockSource.vue";
import BlockOutput from "@/components/notebookViewer/BlockOutput.vue";
import {addPyScript} from "@/mixins/helpers";

@Component({
  components: {BlockOutput, BlockSource}
})
export default class JupyterViewer extends Vue {
  name = "JupyterViewer"
  @Prop(Object) readonly notebook!: Notebook;
  @Prop({default: "python"}) readonly language!: string;
  graphic = true;
  plain = false;
  clickCellIndex = -1;

  mounted() {
    addPyScript()
  }
}
</script>

<style lang="scss">
@import "styles.scss";
</style>
