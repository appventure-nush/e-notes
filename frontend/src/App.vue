<template>
  <v-app>
    <v-app-bar
        app
        color="primary"
        dark
    >
      ENOTES
      <v-btn @click="$store.dispatch('logout')">Logout</v-btn>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class App extends Vue {
}
</script>
