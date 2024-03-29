<template>
  <v-dialog
      :fullscreen="$vuetify.breakpoint.xsOnly"
      v-model="dialog"
      max-width="600px">
    <template v-slot:activator="bind">
      <slot name="activator" v-bind="bind"></slot>
    </template>
    <v-form v-model="valid" ref="form" @submit.prevent="save">
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
                    :disabled="editing"
                    label="Collection ID*"
                    hint="no spaces/unicode, caution changing"
                    :rules="INPUT_ID_RULES"
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
                    :rules="INPUT_NAME_RULES"
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
                        :content="desc"></markdown>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              text
              @click="dialog = false">
            Close
          </v-btn>
          <v-btn
              v-if="editing"
              color="error"
              :disabled="!valid"
              @click="deleteCollection"
              text>
            Delete
          </v-btn>
          <v-btn
              color="primary"
              :disabled="!valid"
              type="submit"
              text>
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import {Collection} from "@/types/coll";
import {del, post} from "@/mixins/api";
import Data from "@/store/data"

@Component({
  name: "CollectionPopup",
  components: {
    Markdown: () => import(/* webpackChunkName: "markdown" */"@/components/markdownViewer/Markdown.vue")
  }
})
export default class CollectionPopup extends Vue {
  @Prop(Object) preset!: Collection;
  @Prop(Boolean) editing!: boolean;
  @Ref('form') form!: Vue & { validate: () => boolean };

  cid = "";
  name = "";
  desc = "";
  open = false;

  saving = false
  dialog = false
  valid = true

  save() {
    if (!this.form) return;
    if (!this.form.validate()) return;
    this.saving = true;
    post(`/api/collections/${this.cid}`, {
      action: this.editing ? "edit" : "add",
      cid: this.cid,
      name: this.name,
      desc: this.desc,
      open: this.open
    }).then(() => {
      Data.fetchCollection(this.cid);
      this.dialog = false;
    }).catch(alert).finally(() => this.saving = false);
  }

  deleteCollection() {
    if (prompt("Confirm Deletion?", 'Collection ID') !== this.cid) return;
    this.saving = true;
    del(`/api/collections/${this.cid}`).then(() => {
      Data.fetchCollections();
      this.$router.push("/");
      this.dialog = false;
    }).catch(alert).finally(() => this.saving = false);
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