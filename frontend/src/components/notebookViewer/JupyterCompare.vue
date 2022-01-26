<template>
  <div class="jupyter-viewer">
    <div
        class="block" :class="{selected:clickCellIndex === index}"
        v-for="(item, index) in Math.max(oldNotebook.cells.length, newNotebook.cells.length)"
        :key="index"
        @mousedown="clickCellIndex = index">
      <BlockSourceCompare
          :outputFormat="outputFormat"
          :diffStyle="diffStyle"
          :new-cell="newNotebook.cells[index]"
          :old-cell="oldNotebook.cells[index]"
          :renderNothingWhenEmpty="renderNothingWhenEmpty"
          :isShowNoChange="isShowNoChange"
          :highlighted="clickCellIndex === index"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Notebook} from "@/types/shims/shims-nbformat-v4";
import BlockSourceCompare from "@/components/notebookViewer/BlockSourceCompare.vue";

@Component({
  components: {BlockSourceCompare}
})
export default class JupyterCompare extends Vue {
  name = "JupyterCompare"
  @Prop(Object) readonly oldNotebook!: Notebook;
  @Prop(Object) readonly newNotebook!: Notebook;
  @Prop(String) readonly outputFormat!: string;
  @Prop(String) readonly diffStyle!: string;
  @Prop(Boolean) readonly renderNothingWhenEmpty!: boolean;
  @Prop(Boolean) readonly isShowNoChange!: boolean;
  clickCellIndex = -1;
}
</script>

<style lang="scss">
pre {
  overflow: auto;
}

.jupyter-viewer {
  width: 100%;
  height: 100%;
}

.block {
  padding: 5px 5px 5px 5px;
  box-sizing: border-box;
  overflow: hidden;

  &.selected {
    backdrop-filter: invert(0.03);
  }

  .block-source {
    width: 100%;
    box-sizing: border-box;

    display: flex;
    flex-direction: row;
  }

  .block-light {
    width: 8px;
    margin: 0 5px 0 0;

    border-radius: 2px;
    background-color: rgba(var(--v-primary-base), 0);

    &:hover {
      background-color: rgba(var(--v-primary-lighten1), 0.75);
    }
  }

  .block-light-selected {
    width: 8px;
    margin: 0 5px 0 0;

    border-radius: 2px;
    background-color: var(--v-primary-base);

    &:hover {
      background-color: var(--v-primary-lighten1);
    }
  }
}
</style>