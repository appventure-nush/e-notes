<template>
  <v-card>
    <v-card-title class="indigo white--text headline">
      User Directory
    </v-card-title>
    <v-row
      class="pa-4"
      justify="space-between">
      <v-col cols="5">
        <v-treeview
          :active.sync="active"
          :items="items"
          :load-children="fetchUsers"
          :open.sync="open"
          activatable
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
            Select a User
          </div>
          <v-card
            v-else
            :key="selected.uid"
            class="pt-6 mx-auto"
            flat
            max-width="400">
            <v-card-text>
              <v-avatar
                v-if="selected.pfp"
                size="88">
                <v-img
                  :src="selected.pfp"
                  class="mb-6"></v-img>
              </v-avatar>
              <h3 class="headline mb-2">
                {{ selected.name }}
              </h3>
              <div class="blue--text mb-2">
                {{ selected.email }}
              </div>
              <div class="blue--text subheading font-weight-bold">
                {{ selected.name }}
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

type User = {
  uid: string;
};

export default Vue.extend({
  data: () => ({
    active: [],
    avatar: null,
    open: [],
    users: new Array<User>()
  }),

  computed: {
    items() {
      return [{
        name: "Users",
        children: this.users,
      }]
    },
    selected() {
      if (!this.active.length) return undefined
      const uid = this.active[0];
      return this.users.find(user => user.uid === uid)
    },
  },

  watch: {},

  methods: {
    async fetchUsers(item: { children: Array<User> }) {
      return await fetcher("/api/users")
        .then(json => {
          console.log("hello!");
          return item.children.push(...(json.users))
        }).catch(err => console.warn(err))
    }
  },
});
</script>
