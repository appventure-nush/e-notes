<template>
  <div class="jupyter-editor">
    <div
        class="block ma-2 rounded" :class="{selected:clickCellIndex === index}"
        style="backdrop-filter: invert(0.05)"
        v-for="(cell, index) in notebook.cells"
        :key="index"
        @mousedown="clickCellIndex = index">
      <BlockSourceEditor
          v-if="'cell_type' in cell"
          v-model="notebook.cells[index]"
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
import {Component, Prop, VModel, Vue} from "vue-property-decorator";
import {Notebook} from "@/types/shims/shims-nbformat-v4";
import BlockOutput from "@/components/notebookViewer/BlockOutput.vue";
import BlockSourceEditor from "@/components/notebookViewer/BlockSourceEditor.vue";

@Component({
  components: {BlockOutput, BlockSourceEditor}
})
export default class JupyterEditor extends Vue {
  name = "JupyterEditor"
  @VModel({type: Object}) readonly notebook!: Notebook;
  @Prop({default: "python"}) readonly language!: string;
  graphic = true;
  plain = false;
  clickCellIndex = -1;
}
</script>

<style lang="scss">
@import "styles.scss";
@import "editor.scss";
</style>
