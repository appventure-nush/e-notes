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
          <span class="text-h5">{{ editing ? "Editing " : "New " }}Note</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                  cols="12"
                  sm="6"
                  md="4">
                <v-text-field
                    v-model="nid"
                    label="Note ID"
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
                    label="Note Name"
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
                <v-autocomplete
                    v-model="type"
                    :items="['auto','jupyter','markdown','html']"
                    label="Note Type"
                    hint="auto only works for uploads"
                    required
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-textarea
                    style="font-family: monospace"
                    outlined
                    v-model="desc"
                    label="Description"
                ></v-textarea>
                <v-card flat outlined style="max-height:150px;overflow-y: auto">
                  <v-card-text>
                    <markdown
                        :key="desc"
                        :content="desc"></markdown>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12">
                <v-file-input
                    v-model="file"
                    label="Note File"
                    hint="supports jupyter notebook, markdown and html"
                    show-size
                    required
                ></v-file-input>
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
import {post} from "@/mixins/api";
import {Note, NoteType} from "@/types/note";
import Markdown from "@/components/markdownViewer/Markdown.vue";
import Data from "@/store/data"

@Component({
  name: "NotePopup",
  components: {
    Markdown
  }
})
export default class NotePopup extends Vue {
  @Prop(Object) preset!: Note;
  @Prop(Boolean) editing!: boolean;
  @Prop(String) readonly cid!: string;
  @Ref('form') form!: Vue & { validate: () => boolean };

  nid = "";
  url = "";
  name = "";
  desc = "";
  type?: NoteType | "auto" = "auto";
  file: File | null = null;

  saving = false
  dialog = false
  valid = true

  save() {
    if (!this.form) return;
    if (!this.form.validate()) return;
    this.saving = true;
    post<{ note: Note }>(`/api/collections/${this.cid}/notes/${this.editing ? this.preset.nid : this.nid}`, {
      action: this.editing ? "edit" : "add",
      nid: this.nid,
      name: this.name,
      desc: this.desc,
      type: this.type === "auto" ? null : this.type
    }).then(json => {
      if (this.file) {
        let formData = new FormData();
        formData.append("note_source", this.file);
        return post<{ note: Note }>(`/api/collections/${this.cid}/notes/${this.nid}/upload`, formData);
      } else return json;
    }).then(() => {
      if (!this.editing) this.$router.push({name: "Note", params: {cid: this.cid, nid: this.nid}});
      if (!this.cid) return;
      Data.fetchNotes(this.cid);
      this.dialog = false;
    }).catch(e => {
      alert(e);
    }).finally(() => this.saving = false);
  }

  @Watch("dialog")
  onDisplayChange() {
    if (!this.dialog) return;
    if (this.editing) {
      if (!this.preset) return;
      this.nid = this.preset.nid;
      this.url = this.preset.url;
      this.name = this.preset.name;
      this.type = this.preset.type || "auto";
      this.desc = this.preset.desc || "";
    } else {
      this.nid = "";
      this.url = "";
      this.name = "";
      this.type = "auto";
      this.desc = "";
    }
  }
}
</script>

<style scoped>

</style>