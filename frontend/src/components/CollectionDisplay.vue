<template>
  <v-col cols="12" :sm="listDisplay?12:6" :lg="listDisplay?12:4" :class="{compact:listDisplay}">
    <v-card
        class="mx-auto"
        outlined>
      <v-list-item :three-line="!listDisplay" :dense="listDisplay">
        <v-list-item-content>
          <div class="text-overline">
            {{ value.cid }}
          </div>
          <v-list-item-title class="mb-1" :class="{'text-h5':!listDisplay}">
            {{ value.name }}
          </v-list-item-title>
          <v-list-item-subtitle v-if="!listDisplay">
            <markdown :content="value.desc"></markdown>
          </v-list-item-subtitle>

          <v-card-actions v-if="listDisplay" class="pa-0">
            <v-btn small text :to="{name:'Collection', params:{cid:value.cid}}">
              Open
            </v-btn>
            <CollectionPopup editing :preset="value" v-if="canEdit(value)">
              <template v-slot:activator="{on}">
                <v-btn :outlined="!listDisplay" :small="listDisplay" rounded text v-on="on" class="ml-2">Edit</v-btn>
              </template>
            </CollectionPopup>
            <v-btn small icon absolute bottom right @click="pinned=!pinned">
              <v-icon small v-if="pinned">mdi-pin</v-icon>
              <v-icon small v-else>mdi-pin-outline</v-icon>
            </v-btn>
          </v-card-actions>
        </v-list-item-content>
        <v-list-item-content v-if="listDisplay" class="my-2">
          <markdown :content="value.desc"></markdown>
        </v-list-item-content>
      </v-list-item>
      <v-card-actions v-if="!listDisplay">
        <v-btn outlined rounded text :to="{name:'Collection', params:{cid:value.cid}}">Open</v-btn>
        <CollectionPopup editing :preset="value" v-if="canEdit(value)">
          <template v-slot:activator="{on}">
            <v-btn outlined rounded text v-on="on" class="ml-2">Edit</v-btn>
          </template>
        </CollectionPopup>
        <v-btn small icon absolute top right @click="pinned=!pinned">
          <v-icon small v-if="pinned">mdi-pin</v-icon>
          <v-icon small v-else>mdi-pin-outline</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
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

  get listDisplay() {
    return Boolean(Config.settings.listDisplay);
  }

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
<style lang="scss">
.compact {
  padding: 4px 6px;

  .v-list-item__content {
    padding: 4px 0;
  }

  .v-card__actions {
    padding: 4px;
  }
}
</style>