<template>
  <v-app>
    <template v-if="!$router.currentRoute.meta.naked && profile">
      <v-navigation-drawer app v-model="drawer">
        <template v-slot:prepend>
          <v-list-item two-line>
            <v-list-item-avatar>
              <v-img :src="pfp" alt="profile pic" lazy-src="/images/guest.png"></v-img>
            </v-list-item-avatar>

            <v-list-item-content v-if="profile">
              <v-list-item-title>{{ profile.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ profile.email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <div class="mx-2 mb-2 hidden-sm-and-down">
            <v-chip class="ma-1" v-if="profile.admin" color="error" label dark small>admin</v-chip>
            <v-chip class="ma-1" v-if="profile.teacher" color="info" label dark small>teacher</v-chip>
            <v-chip class="ma-1" v-else outlined label small>student</v-chip>
            <v-chip class="ma-1" v-for="role in profile.roles" :key="role" v-text="role" outlined label
                    small></v-chip>
          </div>
          <v-row class="px-3 mb-2">
            <v-col cols="6">
              <v-btn to="/profile" color="primary" :outlined="$route.path!=='/profile'" block small depressed>Profile
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn color="error" outlined block small depressed @click="logout">Logout</v-btn>
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
              v-for="item in $router.getRoutes().filter(i=>i.meta.public&&shouldAllow(i))"
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
          <template v-if="isCollectionRoute($route)&&currentCollection">
            <v-divider/>
            <!-- Notes of the current collection -->
            <v-list-group prepend-icon="mdi-folder" :value="true">
              <template v-slot:activator>
                <v-list-item-title>{{ currentCollection.name }}</v-list-item-title>
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
                  v-for="item in currentNotes"
                  :to="{name:'Note Redirect', params:{cid:$route.params.cid,nid:item.nid}}"
                  :key="item.name"
                  link>
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </template>
          <!-- Other collections -->
          <v-list-group prepend-icon="mdi-folder" v-if="collections">
            <template v-slot:activator>
              <v-list-item-title
                  v-text="isCollectionRoute($route)?'Others':'Collections'"></v-list-item-title>
            </template>
            <v-list-item
                v-for="coll in collections.filter(c=>c && (c.cid!==$route.params.cid||!$route.matched.some(({ name }) => name === 'Collection')))"
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
          color="primary"
          dark>
        <v-app-bar-nav-icon @click="drawer=!drawer"></v-app-bar-nav-icon>
        <v-toolbar-title v-if="!$route.meta.hideTitle">{{ $route.name }}</v-toolbar-title>
        <router-view name="appbar"></router-view>
        <v-spacer></v-spacer>
        <v-btn small icon @click="toggleDark" class="mr-1">
          <v-icon v-text="dark?'mdi-white-balance-sunny':'mdi-moon-waxing-crescent'"></v-icon>
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
import {Collection} from "@/types/coll";
import Data from "@/store/data"
import Config from "@/store/config"
import {shouldAllow} from "./router";
import {Route} from 'vue-router'

@Component
export default class App extends Vue {
  shouldAllow(route: Route) {
    return shouldAllow(route);
  }

  get profile() {
    return Config.profile;
  }

  get drawer() {
    return Config.drawer;
  }

  set drawer(drawer: boolean) {
    Config.setDrawer(drawer);
  }

  get currentCollection() {
    return Data.currentCollection;
  }

  get currentNotes() {
    return Data.currentNotes;
  }

  get pfp() {
    return this.profile?.pfp || "/images/guest.png";
  }

  get dark() {
    return Config.dark;
  }

  get collections(): Collection[] {
    return Data.collections;
  }

  toggleDark() {
    Config.setDark(!Config.dark);
    this.$vuetify.theme.dark = Config.dark;
  }

  logout() {
    Config.logout();
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
<style lang="scss">
::-webkit-scrollbar {
  width: .5em;
}

::-webkit-scrollbar-track {
  background: var(--v-background-base);
}

::-webkit-scrollbar-thumb {
  background: var(--v-primary-darken1);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--v-primary-lighten1);
}
</style>