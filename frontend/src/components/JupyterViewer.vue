<template>
  <div class="jupyter-viewer">
    <v-card
        tile
        flat
        :ripple="false"
        v-for="(cell, index) in notebook.cells"
        :key="index"
        class="block"
        color="transparent"
        @mousedown="clickCellIndex = index">
      <BlockSource
          v-if="'cell_type' in cell"
          :cell="cell"
          :md-options="mdOptions"
          :language="language"
          :highlighted="clickCellIndex === index"/>
      <BlockOutput
          v-if="'outputs' in cell"
          :cell="cell"
          :highlighted="clickCellIndex === index"/>
    </v-card>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Notebook} from "@/shims-nbformat-v4";
import BlockSource from "@/components/notebookViewer/BlockSource.vue";
import BlockOutput from "@/components/notebookViewer/BlockOutput.vue";
import {RecursivePartial} from "@/shims-vuex";
import {MarkdownItVueOptions} from "@/components/markdownViewer/markdown";

@Component({
  components: {BlockOutput, BlockSource}
})
export default class JupyterViewer extends Vue {
  name = "JupyterViewer.vue"
  @Prop(Object) readonly notebook!: Notebook;
  @Prop({default: "python"}) readonly language!: string;
  clickCellIndex = -1;

  mdOptions: RecursivePartial<MarkdownItVueOptions> = {
    markdownIt: {
      html: true,
      linkify: true
    },
    katex: {}
  }
}
</script>

<style lang="scss">
pre {
  overflow: auto;
}

blockquote {
  border-left: 0.5em #eee solid;
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
    background-color: rgba(66, 165, 245, 0);

    &:hover {
      background-color: rgba(66, 165, 245, 0.75);
    }
  }

  .block-light-selected {
    width: 8px;
    margin: 0 5px 0 0;

    border-radius: 2px;
    background-color: rgba(66, 165, 245, 1);

    &:hover {
      background-color: darken(rgba(66, 165, 245, 1), 20%);
    }
  }

  .cell-row {
    width: 100%;
    max-width: 100%;
    overflow: hidden;

    .cell-header {
      width: 64px;
      margin: 0 0 0 0;
      padding: 5px 0 0;

      text-align: right;
      font-size: 12px;
      overflow: hidden;

      &.source {
        color: #307fc1;
      }

      &.output {
        color: #bf5b3d;
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
        box-sizing: border-box;
      }

      &.output-err {
        padding: 5px 0 0 5px;
        box-sizing: border-box;
        background-color: #FFDDDD;
      }

      &.output-display > * {
        overflow: auto;

        table {
          border-collapse: collapse;
        }

        td, th {
          padding: 0 2px;
        }
      }
    }
  }
}


</style>