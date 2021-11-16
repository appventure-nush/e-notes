<template>
  <div class="block-output">
    <div :class='[highlighted?"block-light-selected":"block-light"]'/>
    <div class="block-hidden" v-if="hide"/>
    <div class="block-output-content" v-else>
      <v-row v-for="(output,index) of cell.outputs" no-gutters :key="index" class="cell-row flex-nowrap">
        <v-col class="flex-grow-0">
          <pre class="cell-header output"
               v-text="output.output_type === 'execute_result'?`Out [${output.execution_count}]: `:''"></pre>
        </v-col>
        <v-col style="min-width: 0;">
          <v-row no-gutters>
            <v-col v-if="output.output_type === 'stream'">
              <pre :class="[output.name==='stdout'?'output-std' : 'output-err']" v-text="output.text.join('')"></pre>
            </v-col>
            <template v-else-if="output.output_type === 'display_data'||output.output_type === 'execute_result'">
              <v-col cols="12" v-if="'text/plain' in output.data">
                <pre class="cell-content output-std" v-text="output.data['text/plain'].join('')"></pre>
              </v-col>
              <v-col cols="12" class="cell-content output-display">
                <img v-if="'image/png' in output.data" :src="`data:image/png;base64,${output.data['image/png']}`"/>
                <div v-if="'text/html' in output.data" v-html="output.data['text/html'].join('')"></div>
              </v-col>
            </template>
            <pre v-else-if="output.output_type==='error'" class="cell-content output-err"
                 v-html="convert(output.traceback.join('\n'))"></pre>
            <div v-else>Unknown Type {{ output.output_type }}</div>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Cell} from "@/shims-nbformat-v4";
import Convert from "ansi-to-html";

const convert = new Convert();
@Component
export default class BlockOutput extends Vue {
  name = "BlockOutput"
  @Prop(Object) readonly cell!: Cell;
  @Prop({type: Boolean, default: false}) readonly display!: boolean;
  @Prop({type: Boolean, default: false}) highlighted!: boolean;

  convert(text: string) {
    return convert.toHtml(text)
  }

  get hide() {
    return !this.display && this.cell.metadata.collapsed || (this.cell.metadata.jupyter !== undefined && this.cell.metadata.jupyter.outputs_hidden);
  }
}
</script>

<style scoped>

</style>