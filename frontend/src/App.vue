<template>
  <v-app>
    <template v-if="!$router.currentRoute.meta.naked">
      <v-navigation-drawer app v-model="drawer">
        <template v-slot:prepend>
          <v-list-item two-line>
            <v-list-item-avatar>
              <v-img :src="pfp" alt="profile pic" lazy-src="/images/guest.png"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ name }}</v-list-item-title>
              <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <div class="mx-2">
            <v-chip
                class="ma-1"
                v-if="$store.state.profile.admin"
                color="red"
                label
                dark
                small>
              admin
            </v-chip>
            <v-chip
                class="ma-1"
                v-for="role in $store.state.profile.roles"
                :key="role"
                outlined
                label
                small>
              {{ role }}
            </v-chip>
          </div>
          <v-row class="px-3 mb-2">
            <v-col cols="6">
              <v-btn to="/profile" color="primary" :outlined="$route.path!=='/profile'" block small depressed>Profile
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn color="red" outlined block small depressed @click="$store.dispatch('logout')">Logout</v-btn>
            </v-col>
          </v-row>
        </template>
        <v-divider></v-divider>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              Contents
            </v-list-item-title>
            <v-list-item-subtitle>
              e-notes
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list
            dense
            nav>
          <!-- navigation links -->
          <v-list-item
              v-for="item in $router.getRoutes().filter(i=>i.meta.public)"
              :to="item"
              :key="item.name"
              exact
              link>
            <v-list-item-icon>
              <v-icon>{{ item.meta.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <!-- if in collection/notes page, show notes list -->
          <template v-if="$route.name==='Collection'||$route.name==='Note'">
            <v-divider/>
            <v-list-group prepend-icon="mdi-folder">
              <template v-slot:activator>
                <v-list-item-title>{{ $store.state.currentCollection.name }}</v-list-item-title>
              </template>
              <v-list-item
                  :to="{name:'Collection', params:{cid:$route.params.cid}}"
                  exact
                  link>
                <v-list-item-content>
                  <v-list-item-title>/{{ $route.params.cid }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                  v-for="item in $store.state.currentNotes"
                  :to="{name:'Note', params:{cid:$route.params.cid,nid:item.nid}}"
                  :key="item.name"
                  exact-path
                  link>
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </template>
        </v-list>
      </v-navigation-drawer>
      <v-app-bar
          app
          hide-on-scroll
          color="primary"
          dark>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>{{ $route.name }}</v-toolbar-title>
        <router-view name="appbar"></router-view>
        <v-spacer></v-spacer>
        <v-btn small icon @click="toggleDark" class="mr-1">
          <v-icon v-text="$store.state.dark?'mdi-white-balance-sunny':'mdi-moon-waxing-crescent'"></v-icon>
        </v-btn>
      </v-app-bar>
    </template>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class App extends Vue {
  drawer = false;

  get pfp() {
    return this.$store.state.profile.pfp || "/images/guest.png";
  }

  get name() {
    return this.$store.state.profile.name;
  }

  get email() {
    return this.$store.state.profile.email;
  }

  mounted() {
    console.log('mounted')
  }

  toggleDark() {
    this.$store.dispatch('toggleDark');
    this.$vuetify.theme.dark = this.$store.state.dark;
  }
}
</script>
<style>
.markdown-body {
  color: inherit !important;
}
</style>