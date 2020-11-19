<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>
        NUSH Notes
      </v-toolbar-title>
    </v-app-bar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import User from "@/types/user";

export default Vue.extend({
  name: "App",
  data: () => ({
    drawerShown: false,
  }),
  computed: {
    routes(): Array<{ name: string; route: string; icon: string; }> {
      return [
        {
          name: "Main page",
          route: "/",
          icon: "mdi-file-table-box",
        },
      ];
    },
    user(): User | null {
      return this.$store.state.user;
    }
  }
});
</script>
