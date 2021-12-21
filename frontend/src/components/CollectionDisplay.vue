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
          <markdown :content="value.desc"></markdown>
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
      <CollectionPopup editing :preset="value" v-if="canEdit(value)">
        <template v-slot:activator="{on}">
          <v-btn outlined rounded text v-on="on" class="ml-2">
            Edit
          </v-btn>
        </template>
      </CollectionPopup>
      <v-btn small icon absolute top right @click="pinned=!pinned">
        <v-icon small v-if="pinned">mdi-pin</v-icon>
        <v-icon small v-else>mdi-pin-outline</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Collection} from "@/types/coll";
import CollectionPopup from "@/components/popup/CollectionPopup.vue";
import Markdown from "@/components/markdownViewer/Markdown.vue";
import Config from "@/store/config";

@Component({
  components: {
    CollectionPopup,
    Markdown
  }
})
export default class CollectionDisplay extends Vue {
  name = "Collection Display"
  @Prop(Object) readonly value?: Collection;

  get pinned() {
    return Boolean(this.value && Config.settings.pinnedCollections && Config.settings.pinnedCollections.includes(this.value.cid));
  }

  set pinned(pinned: boolean) {
    if (!this.value) return;
    let pinnedCollections = Config.settings.pinnedCollections || [];
    if (pinned && !pinnedCollections.includes(this.value.cid)) pinnedCollections.push(this.value.cid);
    else if (!pinned && pinnedCollections.includes(this.value.cid)) pinnedCollections = pinnedCollections.filter(c => c !== this.value?.cid);
    Config.updateSettings({...Config.settings, pinnedCollections});
  }
}
</script>