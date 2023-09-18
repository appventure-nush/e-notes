<template>
  <div :class="{'block-output':true,'block-hidden':hide}">
    <div :class='{"block-light-selected":highlighted,"block-light":!highlighted}'/>
    <div class="block-hidden" v-if="hide"/>
    <div class="block-output-content" v-else>
      <v-row v-for="(output,index) of cell.outputs" no-gutters :key="index" class="cell-row">
        <v-col class="flex-grow-0">
          <pre class="cell-header output"
               v-text="output.output_type === 'execute_result'?`Out [${output.execution_count}]: `:''"></pre>
        </v-col>
        <v-col :style="{'min-width':$vuetify.breakpoint.xsOnly?'100%':'0'}">
          <v-row no-gutters>
            <v-col v-if="output.output_type === 'stream'">
              <pre class="cell-content" :class="[output.name==='stdout'?'output-std' : 'output-err']"
                   v-text="output.text.join('')"></pre>
            </v-col>
            <template v-else-if="output.output_type === 'display_data'||output.output_type === 'execute_result'">
              <v-col cols="12" v-if="showPlaintext(output.data)">
                <pre class="cell-content output-std" v-text="output.data['text/plain'].join('')"></pre>
              </v-col>
              <v-col cols="12" v-if="graphic" class="cell-content output-display">
                <img v-if="'image/png' in output.data" alt="Image Error"
                     :src="b64ToUrl(normaliseJupyterOutput(output.data['image/png']),'image/png')"/>
                <HTMLOutput v-if="'text/html' in output.data" :html="output.data['text/html'].join('')" />
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
<style>
.v-application.theme--dark.force-img-dark .block-output img {
  filter: invert(1) hue-rotate(180deg);
}
</style>
<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Cell} from "@/types/shims/shims-nbformat-v4";
import Convert from "ansi-to-html";
import HTMLOutput from "@/components/notebookViewer/HTMLOutput.vue";

const convert = new Convert();
@Component({
  components: {HTMLOutput}
})
export default class BlockOutput extends Vue {
  name = "BlockOutput"
  @Prop(Object) readonly cell!: Cell;
  @Prop({type: Boolean, default: false}) readonly display!: boolean;
  @Prop({type: Boolean, default: false}) highlighted!: boolean;
  @Prop({default: true}) readonly graphic!: boolean;
  @Prop({default: true}) readonly plain!: boolean;

  showPlaintext(data: { [k: string]: string | string[] }) {
    if (this.plain) {
      return 'text/plain' in data;
    } else return !(this.graphic && ('image/png' in data || 'text/html' in data));
  }

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
