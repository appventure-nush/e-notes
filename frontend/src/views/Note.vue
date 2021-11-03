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
          <template v-slot:additional>{{ note.lastEdit | moment("MMMM Do YYYY, hh:mm a") }}</template>
        </UserChip>
      </v-card-text>
      <v-card-actions v-if="canEdit($store.state.currentCollection)">
        <v-btn text color="primary">Edit</v-btn>
      </v-card-actions>
    </v-card>
    <v-divider class="my-3"/>
    <JupyterViewer v-if="note.type==='jupyter'" :rawIpynb="doc"></JupyterViewer>
    <markdown v-else-if="note.type==='markdown'" :content="doc" :options="$store.state.markdownOptions"></markdown>
    <div ref="shadowRoot"></div>
    <v-skeleton-loader
        v-if="!doc"
        class="mx-auto"
        type="article,image,article,card"
    ></v-skeleton-loader>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
// @ts-ignore
import JupyterViewer from "react-jupyter-notebook";
import UserChip from "@/components/UserChip.vue";
//@ts-ignore
import MarkdownItVueLight from 'markdown-it-vue/dist/markdown-it-vue-light.umd.min.js'
import 'markdown-it-vue/dist/markdown-it-vue-light.css'

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
    JupyterViewer,
    markdown: MarkdownItVueLight as any
  }
})
export default class Note extends Vue {
  @Ref('shadowRoot') readonly shadowRoot!: HTMLDivElement

  @Prop(String) readonly cid?: string;
  @Prop(String) readonly nid?: string;
  name = "Note";
  doc?: any = null;
  shadow?: ShadowRoot;

  @Watch('doc')
  onDocChange() {
    if (this.note.type && this.note.type !== "html") return;
    this.shadow = this.shadowRoot.attachShadow({mode: 'open'});
    this.shadow.innerHTML = additionalStyles + this.doc;
  }

  mounted() {
    this.onNoteChange();
  }

  get note() {
    return this.$store.state.currentNote;
  }

  @Watch('nid')
  onNoteChange() {
    this.doc = "";
    this.$store.cache.dispatch("getCollectionNotes", this.cid).then((res: Note[]) => res.find(n => n.nid === this.nid)).then(json => {
      if (!json) return this.$router.push(`/collections/${this.cid}`);
      this.$store.commit("setCurrentNote", json);
      fetch(this.note.url).then(res => res.text()).then(text => {
        this.doc = this.note.type === "jupyter" ? JSON.parse(text) : text;
      });
    })
  }

  @Watch('$route.hash')
  onHashChange() {
    if (!this.shadow) return;
    let elementToFocus = this.shadow.getElementById(window.location.hash.slice(1)) || this.shadow.querySelector(`[name='${window.location.hash.slice(1)}']`);
    if (elementToFocus) elementToFocus.scrollIntoView();
  }
}
</script>