<template>
  <v-card>
    <v-card-title class="indigo white--text headline">
      Role Directory
    </v-card-title>
    <v-row
      class="pa-4"
      justify="space-between">
      <v-col cols="5">
        <v-treeview
          :active.sync="active"
          :items="items"
          :load-children="fetchRoles"
          :open.sync="open"
          activatable
          item-key="rid"
          color="warning"
          open-on-click
          transition>
          <template v-slot:prepend="{ item }">
            <v-icon v-if="!item.children">
              mdi-account
            </v-icon>
          </template>
        </v-treeview>
      </v-col>

      <v-divider vertical></v-divider>

      <v-col class="d-flex text-center">
        <v-scroll-y-transition mode="out-in">
          <div
            v-if="!selected"
            class="title grey--text text--lighten-1 font-weight-light"
            style="align-self: center;">
            Select a Role
          </div>
          <v-card
            v-else
            :key="selected.rid"
            class="pt-6 mx-auto"
            flat
            max-width="400">
            <v-card-text>
              <h3 class="headline mb-2">
                {{ selected.name }}
              </h3>
              <div class="blue--text mb-2">
                {{ selected.desc }}
              </div>
              <div class="blue--text subheading font-weight-bold">
                {{ selected.rid }}
              </div>
            </v-card-text>
          </v-card>
        </v-scroll-y-transition>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import {firebase, auth} from "../firebase";
import {fetcher} from "@/api";

type Role = {
  rid: string;
  name: string;
  desc: string;
};

export default Vue.extend({
  data: () => ({
    active: [],
    open: [],
    roles: new Array<Role>()
  }),

  computed: {
    items() {
      return [{
        name: "Roles",
        children: this.roles,
      }]
    },
    selected() {
      if (!this.active.length) return undefined;
      const rid = this.active[0];
      return this.roles.find(role => role.rid === rid);
    },
  },

  methods: {
    async fetchRoles(item: { children: Array<Role> }) {
      return await fetcher("/api/roles")
        .then(json => item.children.push(...json))
        .catch(err => console.warn(err))
    }
  },
});
</script>
