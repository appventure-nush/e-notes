<template>
  <v-card
      class="mx-auto"
      outlined>
    <v-list-item three-line>
      <v-list-item-content>
        <div class="text-overline">
          {{ value.cid }}
        </div>
        <v-list-item-title class="text-h5 mb-1">
          {{ value.name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          <markdown :content="value.desc" :options="$store.state.markdownOptions"></markdown>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-card-actions>
      <v-btn
          outlined
          rounded
          text
          :to="{name:'Collection', params:{cid:value.cid}}">
        Open
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Collection} from "@/types/coll";
import MarkdownItVue from 'markdown-it-vue'
import 'markdown-it-vue/dist/markdown-it-vue.css'

@Component({
  components: {
    markdown: MarkdownItVue as any
  }
})
export default class CollectionDisplay extends Vue {
  name = "Collection Display"
  @Prop(Object) readonly value: Collection | undefined
}
</script>

<style scoped>

</style>