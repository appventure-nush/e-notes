<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-toolbar-title>
        Nush e-notes
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
  mounted() {
    const user = localStorage.getItem("user");
    if (!user) {
      return user
    }
    this.$store.state.user = JSON.parse(user) as User;
  },
  computed: {
    routes(): Array<{
      name: string;
      route: string;
      icon: string;
    }> {
      // Add routes here to correspond to router.ts
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
