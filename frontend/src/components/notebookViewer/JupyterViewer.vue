<template>
  <div class="jupyter-viewer">
    <div
        class="block"
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

@Component({
  components: {BlockOutput, BlockSource}
})
export default class JupyterViewer extends Vue {
  name = "JupyterViewer.vue"
  @Prop(Object) readonly notebook!: Notebook;
  @Prop({default: "python"}) readonly language!: string;
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

  .block-hidden {
    width: 100%;
    min-height: 20px;
  }

  .block-source {
    width: 100%;
    box-sizing: border-box;

    display: flex;
    flex-direction: row;
  }

  .block-output {
    width: 100%;
    margin: 5px 0 0 0;
    box-sizing: border-box;

    display: flex;
    flex-direction: row;

    .block-output-content {
      width: 100%;
      overflow-y: auto;
    }
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

  .cell-row {
    width: 100%;
    max-width: 100%;
    overflow: hidden;

    .cell-header {
      width: 64px;
      margin: 0 0 0 0;
      padding: 8px 0 0;

      text-align: right;
      font-size: 12px;
      overflow: hidden;

      &.source {
        color: var(--v-info-base);
      }

      &.output {
        color: var(--v-error-base);
      }
    }

    .cell-content {
      width: auto;
      margin: 0 0 0 0;

      &.source-code {
        margin: 5px 0 0 5px;
        padding-left: 5px;
      }

      &.source-markdown {
        padding: 5px 10px;
        box-sizing: border-box;

        p {
          margin-bottom: inherit;
        }
      }

      &.output-std {
        padding: 5px 0 0 5px;
      }

      &.output-err {
        flex-grow: 1;
        padding: 5px 0 0 5px;
        background-color: #ef717140;
      }

      &.output-display > * {
        max-width: 100%;
        overflow: auto;
      }

      &.output-display table {
        border-collapse: collapse;
        border: none;

        td, th {
          border: none;
          padding: 0.1em 0.2em;
        }

        th,
        tr:nth-child(even) {
          background: #8883;
        }
      }
    }
  }
}


</style>