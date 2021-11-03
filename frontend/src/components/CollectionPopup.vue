<template>
  <v-dialog
      v-model="dialog"
      max-width="600px">
    <template v-slot:activator="bind">
      <slot name="activator" v-bind="bind"></slot>
    </template>
    <v-card
        :disabled="saving"
        :loading="saving">
      <v-card-title>
        <span class="text-h5">{{ editing ? "Editing " : "New " }}Collection</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col
                cols="12"
                sm="6"
                md="4">
              <v-text-field
                  v-model="cid"
                  label="Collection ID*"
                  hint="no spaces/unicode, caution changing"
                  required
              ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                sm="6"
                md="4"
            >
              <v-text-field
                  v-model="name"
                  label="Collection Name*"
                  hint="spaces are allowed here"
                  required
              ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                sm="6"
                md="4"
            >
              <v-checkbox
                  v-model="open"
                  label="Public"
                  hint="if everyone by default can read this collection"
                  persistent-hint
              ></v-checkbox>
            </v-col>
            <v-col cols="12">
              <v-textarea
                  style="font-family: monospace"
                  outlined
                  v-model="desc"
                  label="Description"
              ></v-textarea>
              <v-card flat outlined>
                <v-card-text>
                  <markdown
                      :key="desc"
                      :content="desc"
                      :options="$store.state.markdownOptions"></markdown>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="blue darken-1"
            text
            @click="dialog = false">
          Close
        </v-btn>
        <v-btn
            color="blue darken-1"
            text
            @click="save">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {Collection} from "@/types/coll";
// @ts-ignore
import MarkdownItVueLight from 'markdown-it-vue/dist/markdown-it-vue-light.umd.min.js'
import 'markdown-it-vue/dist/markdown-it-vue-light.css'
import {post} from "@/api/api";

@Component({
  name: "CollectionPopup",
  components: {
    markdown: MarkdownItVueLight as any
  }
})
export default class CollectionPopup extends Vue {
  @Prop(Object) preset!: Collection;
  @Prop(Boolean) editing!: boolean;

  cid = "";
  name = "";
  desc = "";
  open = false;

  saving = false
  dialog = false

  save() {
    this.saving = true;
    post(`/api/collections/${this.cid}`, {
      action: this.editing ? "edit" : "add",
      cid: this.cid,
      name: this.name,
      desc: this.desc,
      open: this.open
    }).then(res => res.json()).then(json => {
      if (json.status !== "success") {
        alert(json.reason);
      } else {
        this.$store.commit('setCurrentColl', json.collection);
        this.dialog = false;
      }
    }).finally(() => this.saving = false);
  }

  @Watch("dialog")
  onDisplayChange() {
    if (!this.dialog) return;
    if (this.editing) {
      if (!this.preset) return;
      this.cid = this.preset.cid;
      this.name = this.preset.name;
      this.open = this.preset.open;
      this.desc = this.preset.desc;
    } else {
      this.cid = "";
      this.name = "";
      this.open = false;
      this.desc = "";
    }
  }
}
</script>

<style scoped>

</style>