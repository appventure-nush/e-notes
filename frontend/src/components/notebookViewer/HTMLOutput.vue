<template>
    <div v-html="html" ref="htmlDiv"></div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class HTMLOutput extends Vue {
  name = "HTMLOutput"
  @Prop(String) readonly html!: string;

  createScript(node: HTMLScriptElement) {
    var script = document.createElement("script");
    script.text = node.innerHTML;
    
    for (var i=0; i < node.attributes.length; i++) {
      var attr = node.attributes[i];
      script.setAttribute(attr.name, attr.value);
    }
    return script;
  }

  recurseDescendants (node: Element) {
    for (var i = 0; i < node.children.length; i++) {
      var child = node.children[i];
      this.recurseDescendants(child);
      if (child.tagName === 'SCRIPT') {
        node.replaceChild(this.createScript(child as HTMLScriptElement), child);
      }
    }
  }

  mounted() {
    console.log("running scripts");
    this.$nextTick(() => {
        this.recurseDescendants(this.$refs.htmlDiv as Element);
    });
  }
}
</script>

<style scoped>

</style>
