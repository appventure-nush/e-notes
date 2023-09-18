<template>
    <div v-html="html" ref="htmlDiv"></div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class HTMLOutput extends Vue {
  name = "HTMLOutput"
  @Prop(String) readonly html!: string;

  recurseDescendants (node: Element) {
    for (var i = 0; i < node.children.length; i++) {
      var child = node.children[i];
      this.recurseDescendants(child);
      if (child.tagName === 'SCRIPT') {
        console.log(child.innerHTML);
        eval?.(child.innerHTML);
        child.remove();
        i--;
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
