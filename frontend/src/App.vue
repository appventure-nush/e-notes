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
              :exact="item.meta.exact"
              link>
            <v-list-item-icon>
              <v-icon>{{ item.meta.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <!-- if in collection/notes page, show notes list -->
          <template v-if="$route.matched.some(({ name }) => name === 'Collection')">
            <v-divider/>
            <!-- Notes of the current collection -->
            <v-list-group prepend-icon="mdi-folder" :value="true">
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
                  :to="{name:'Note Redirect', params:{cid:$route.params.cid,nid:item.nid}}"
                  :key="item.name"
                  link>
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
            <!-- Other collections -->
          </template>
          <v-list-group prepend-icon="mdi-folder">
            <template v-slot:activator>
              <v-list-item-title
                  v-text="$route.matched.some(({ name }) => name === 'Collection')?'Others':'Collections'"></v-list-item-title>
            </template>
            <v-list-item
                v-for="coll in $store.state.collections.filter(c=>c.cid!==$route.params.cid||!$route.matched.some(({ name }) => name === 'Collection'))"
                :to="{name:'Collection',params:{cid:coll.cid}}"
                :key="coll.cid"
                link>
              <v-list-item-content>
                <v-list-item-title>{{ coll.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </v-list>
      </v-navigation-drawer>
      <v-app-bar
          app
          elevate-on-scroll
          hide-on-scroll
          scroll-threshold="69"
          color="primary"
          dark>
        <v-app-bar-nav-icon @click="drawer=!drawer"></v-app-bar-nav-icon>
        <v-toolbar-title v-if="!$route.meta.hideTitle">{{ $route.name }}</v-toolbar-title>
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
  get pfp() {
    return this.$store.state.profile?.pfp || "/images/guest.png";
  }

  get name() {
    return this.$store.state.profile?.name;
  }

  get email() {
    return this.$store.state.profile?.email;
  }

  get drawer() {
    return this.$store.state.drawerOpen;
  }

  set drawer(val: boolean) {
    this.$store.commit("setDrawer", val);
  }

  mounted() {
    console.log('mounted')
  }

  toggleDark() {
    this.$store.commit('toggleDark');
    this.$vuetify.theme.dark = this.$store.state.dark;
  }
}
</script>
<style>
.markdown-body {
  color: inherit !important;
}

.v-application code {
  background-color: unset !important;
}
</style>