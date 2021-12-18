<template>
  <v-app v-touch="touchOptions">
    <v-navigation-drawer v-if="profile" app v-model="drawer">
      <template v-slot:prepend>
        <v-list-item two-line>
          <v-list-item-avatar>
            <v-img :src="pfp" v-if="pfp"></v-img>
            <span class="white--text text-h5" v-else>{{ initials(profile.name) }}</span>
          </v-list-item-avatar>

          <v-list-item-content v-if="profile">
            <v-list-item-title v-text="profile.nickname||profile.name"></v-list-item-title>
            <v-list-item-subtitle v-text="profile.email"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <div class="mx-2 mb-2 hidden-sm-and-down">
          <v-chip class="ma-1" v-if="profile.admin" color="error" label dark small>admin</v-chip>
          <v-chip class="ma-1" v-if="profile.teacher" color="info" label dark small>teacher</v-chip>
          <v-chip class="ma-1" v-else outlined label small>student</v-chip>
          <v-chip class="ma-1" v-for="role in profile.roles" :key="role" v-text="role" outlined label small></v-chip>
        </div>
        <div class="d-flex">
          <v-btn to="/profile" color="primary" small depressed :outlined="$route.path!=='/profile'"
                 class="flex-grow-1 mx-2 mb-2">Profile
          </v-btn>
          <v-btn color="error" outlined small depressed @click="logout"
                 class="flex-grow-1 mx-2 mb-2">Logout
          </v-btn>
        </div>
      </template>
      <v-list
          dense
          nav>
        <!-- navigation links -->
        <v-list-item v-for="item in $router.getRoutes().filter(i=>i.meta.public&&shouldAllow(i))" :to="item"
                     :key="item.name" :exact="item.meta.exact" link>
          <v-list-item-icon>
            <v-icon>{{ item.meta.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
        <!-- if in collection/notes page, show notes list -->
        <template v-if="isCollectionRoute($route)&&currentCollection">
          <v-divider class="my-1"></v-divider>
          <!-- Notes of the current collection -->
          <v-list-group prepend-icon="mdi-folder" :value="true">
            <template v-slot:activator>
              <v-list-item-title>{{ currentCollection.name }}</v-list-item-title>
            </template>
            <v-list-item :to="{name:'Collection', params:{cid:$route.params.cid}}" exact>
              <v-list-item-title>/{{ $route.params.cid }}</v-list-item-title>
            </v-list-item>
            <v-list-item
                v-for="item in currentNotes"
                :to="{name:'Note Redirect', params:{cid:$route.params.cid,nid:item.nid}}" :key="item.name">
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app v-model="appbar" fixed dense elevate-on-scroll color="primary" dark>
      <v-app-bar-nav-icon @click="drawer=!drawer"></v-app-bar-nav-icon>
      <v-toolbar-title v-if="!$route.meta.hideTitle">{{ $route.name }}</v-toolbar-title>
      <router-view name="appbar"></router-view>
      <v-spacer></v-spacer>
      <v-btn small icon @click="toggleDark" class="mr-1">
        <v-icon v-text="dark?'mdi-white-balance-sunny':'mdi-moon-waxing-crescent'"></v-icon>
      </v-btn>
    </v-app-bar>
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
import {shouldAllow} from "@/router";
import {Route} from 'vue-router'
import {User} from "@/types/user";
import {Note} from "@/types/note";

@Component
export default class App extends Vue {
  appbar = true;
  counter = 0;

  shouldAllow(route: Route) {
    return shouldAllow(route);
  }

  get profile(): User | null {
    return Config.profile;
  }

  get drawer() {
    return Config.drawer;
  }

  set drawer(drawer: boolean) {
    Config.setDrawer(drawer);
    this.counter++;
    if (this.counter > 100 && !document.body.classList.contains('rb')) document.body.classList.add('rb');
  }

  get currentCollection(): Collection | null {
    return Data.currentCollection;
  }

  get currentNotes(): Note[] | null {
    return Data.currentNotes;
  }

  get pfp() {
    return this.profile?.pfp;
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

  readonly touchOptions = {
    down: () => this.appbar = true,
    right: () => this.drawer = true,
    left: () => this.drawer = false
  };
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
  height: .5em;
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

body.rb.rb-lock-off {
  animation: rainbow 4s steps(36) infinite;
}

@-webkit-keyframes rainbow {
  from {
    -webkit-filter: hue-rotate(10deg);
  }
  to {
    -webkit-filter: hue-rotate(360deg);
  }
}

@keyframes rainbow {
  from {
    -webkit-filter: hue-rotate(10deg);
    filter: hue-rotate(10deg);
  }
  to {
    -webkit-filter: hue-rotate(360deg);
    filter: hue-rotate(360deg);
  }
}
</style>