<template>
  <v-container>
    <v-card
        shaped
        outlined>
      <v-card-title>{{ note.name }}</v-card-title>
      <v-card-subtitle>{{ note.nid }}</v-card-subtitle>
      <v-card-text>
        <div><strong>Last Edited</strong></div>
        <UserChip :uid.sync="note.lastEditBy" admin>
          <template v-slot:additional>{{ note.lastEdit | moment("dddd, MMMM Do YYYY") }}</template>
        </UserChip>
      </v-card-text>
    </v-card>
    <v-divider class="my-3"/>
    <div ref="shadowRoot" v-if="!note.jupyter"></div>
    <JupyterViewer v-else :rawIpynb="doc"></JupyterViewer>
    <v-skeleton-loader
        v-if="loading"
        class="mx-auto"
        type="card"
    ></v-skeleton-loader>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
// @ts-ignore
import JupyterViewer from "react-jupyter-notebook";
import {get} from "@/api/api";
import UserChip from "@/components/UserChip.vue";

const additionalStyles = '<style>\n' +
    '.container{width:auto!important;}\n' +
    '#notebook-container{padding:0!important;-webkit-box-shadow:none!important;box-shadow:none!important;}\n' +
    '.prompt{min-width:0;}\n' +
    '</style>\n' +
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">\n' +
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/github-markdown-css/2.2.1/github-markdown.css"/>\n' +
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/styles/default.min.css">';
// @ts-ignore
@Component({
  components: {
    UserChip,
    JupyterViewer
  }
})
export default class Note extends Vue {
  @Ref('shadowRoot') readonly shadowRoot!: HTMLDivElement

  @Prop(String) readonly cid?: string;
  @Prop(String) readonly nid?: string;
  name = "Note";
  doc?: any = null;
  loading = false;
  shadow?: ShadowRoot;

  @Watch('doc')
  onDocChange() {
    if (!this.shadow) return;
    this.shadow.innerHTML = this.doc;
  }

  mounted() {
    this.shadow = this.shadowRoot.attachShadow({mode: 'open'});
    this.onNoteChange();
  }

  get note() {
    return this.$store.state.currentNote;
  }

  @Watch('nid')
  onNoteChange() {
    this.doc = "";
    this.loading = true;
    get(`/api/collections/${this.cid}/notes/${this.nid}`).then(res => res.json()).then(json => {
      if (json.status && json.status !== "success") return this.$router.push(`/collections/${this.cid}`);
      this.$store.commit("setCurrentNote", json);
      fetch(this.note.url).then(res => res.text()).then(text => {
        console.log("loading done")
        this.loading = false;
        this.doc = this.note.jupyter ? JSON.parse(text) : additionalStyles + text;
      });
    })
  }

  @Watch('$route.hash')
  onHashChange() {
    if (!this.shadow) return;
    console.log(this.$route.hash);
    let elementToFocus = this.shadow.getElementById(window.location.hash.slice(1)) || this.shadow.querySelector(`[name='${window.location.hash.slice(1)}']`);
    if (elementToFocus) elementToFocus.scrollIntoView();
  }
}
</script>