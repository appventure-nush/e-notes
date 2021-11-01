<template>
  <v-container>
    <template v-if="$route.name==='Collection'">
      <v-card outlined shaped>
        <v-card-title v-text="coll.name"></v-card-title>
        <v-card-subtitle class="pb-2" v-text="coll.cid"></v-card-subtitle>
        <v-chip class="mx-4 mb-2" small label :color="coll.open?'success':'error'"
                v-text="coll.open?'Open':'Private'"></v-chip>
        <v-divider/>
        <v-card-text>
          <markdown :content="coll.desc" :options="$store.state.markdownOptions"></markdown>
        </v-card-text>

        <v-card-text class="pb-2"><strong>Roles with access</strong></v-card-text>
        <div class="mx-3">
          <v-chip class="mx-1" small label
                  v-for="role in $store.state.currentRoles"
                  v-text="role.rid"
                  :key="role.rid">
          </v-chip>
        </div>
        <v-card-text class="pb-2"><strong>Owner</strong></v-card-text>
        <div class="mx-4">
          <UserChip :uid.sync="coll.owner" admin></UserChip>
        </div>
        <v-card-text>
          <v-row>
            <v-col cols="6" sm="4" md="3" lg="2"

            >
              <v-img>

              </v-img>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn text>
            Hello
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
    <router-view></router-view>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {get} from "@/api/api";
import MarkdownItVue from 'markdown-it-vue'
import 'markdown-it-vue/dist/markdown-it-vue.css'
import UserChip from "@/components/UserChip.vue";

@Component({
  components: {
    UserChip,
    markdown: MarkdownItVue as any
  }
})
export default class Collection extends Vue {
  @Prop(String) readonly cid?: string;
  name = "Collection";
  images: { src: string, name: string }[] = [];

  mounted() {
    get(`/api/collections/${this.cid}`).then(res => res.json()).then(json => {
      if (json.status && json.status !== "success") {
        console.log(json);
        return this.$router.push("/");
      }
      this.$store.commit("setCurrentColl", json);
    });
    get(`/api/collections/${this.cid}/roles`).then(res => res.json()).then(json => this.$store.commit("setCurrentRoles", json));
    get(`/api/collections/${this.cid}/notes`).then(res => res.json()).then(json => this.$store.commit("setCurrentNotes", json));
    get(`/api/collections/${this.cid}/img`).then(res => res.json()).then(json => this.images = json);
  }

  get coll() {
    return this.$store.state.currentCollection;
  }
}
</script>

<style scoped>

</style>