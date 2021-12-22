<template>
  <v-app v-touch="touchOptions" :class="{uwu}">
    <v-navigation-drawer :permanent="permanent" v-if="profile" app v-model="drawer" :mini-variant="mini">
      <template v-slot:prepend>
        <v-list-item two-line ripple @click="profileCard=!profileCard"
                     :class="{'px-0': mini,'justify-center':mini}">
          <v-list-item-avatar :color="getHashCode(profile.name)">
            <v-img :src="pfp" v-if="pfp"></v-img>
            <span class="white--text text-h5" v-else>{{ initials(profile.name) }}</span>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-text="profile.nickname||profile.name"></v-list-item-title>
            <v-list-item-subtitle v-text="profile.email"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-expand-transition>
          <div v-if="profileCard">
            <div class="mx-2 pb-2 hidden-sm-and-down" v-if="!mini">
              <v-chip class="ma-1" v-if="profile.admin" color="error" label dark small>admin</v-chip>
              <v-chip class="ma-1" v-if="profile.teacher" color="info" label dark small>teacher</v-chip>
              <v-chip class="ma-1" v-else outlined label small>student</v-chip>
              <v-chip class="ma-1" v-for="role in profile.roles" :key="role" v-text="role" outlined label
                      small></v-chip>
            </div>
            <v-list-item dense to="/profile" color="primary">
              <v-list-item-icon>
                <v-icon>mdi-account-box</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item dense color="error" link @click="logout">
              <v-list-item-icon>
                <v-icon>mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </div>
        </v-expand-transition>
        <v-divider class="my-1"></v-divider>
      </template>
      <v-list
          dense
          nav>
        <!-- navigation links -->
        <v-list-item color="primary" v-for="item in $router.getRoutes().filter(i=>i.meta.public&&shouldAllow(i))"
                     :to="item" :key="item.name" :exact="item.meta.exact" link>
          <v-list-item-icon>
            <v-icon>{{ item.meta.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ item.name || item.meta.title }}</v-list-item-title>
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
        <v-list-group prepend-icon="mdi-folder">
          <template v-slot:activator>
            <v-list-item-title>Collections</v-list-item-title>
          </template>
          <v-list-item
              v-for="item in collections"
              :to="{name:'Collection', params:{cid:item.cid}}" :key="item.cid">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </v-list>
      <template v-slot:append>
        <v-list-item link @click="mini=!mini">
          <v-list-item-icon>
            <v-icon>mdi-page-layout-sidebar-left</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Collapse</v-list-item-title>
        </v-list-item>
      </template>
    </v-navigation-drawer>
    <v-app-bar app fixed dense elevate-on-scroll color="appbar" dark>
      <v-app-bar-nav-icon v-if="!permanent" @click="drawer=!drawer"></v-app-bar-nav-icon>
      <v-toolbar-title v-if="!$route.meta.hideTitle">{{ $route.name }}</v-toolbar-title>
      <router-view name="appbar"></router-view>
      <v-spacer></v-spacer>
      <v-btn small icon class="mr-1"
             :to="$route.name==='Settings'?($route.query.back||'/'):{name:'Settings',query:{back:$route.path}}">
        <v-icon v-text="$route.name==='Settings'?'mdi-cog':'mdi-cog-outline'"></v-icon>
      </v-btn>
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
import {Component, Vue, Watch} from "vue-property-decorator";
import {Collection} from "@/types/coll";
import Data from "@/store/data"
import Config from "@/store/config"
import {shouldAllow} from "@/router";
import {Route} from 'vue-router'
import {User} from "@/types/user";
import {Note} from "@/types/note";
import {removeDarkModeListener, requestDarkModeListener} from "@/mixins/helpers";
import {EventBus} from "@/event";

@Component
export default class App extends Vue {
  profileCard = false;
  counter = 0;
  requestedDarkMode = false;

  created() {
    requestDarkModeListener(this.autoDarkCallback);
  }

  destroyed() {
    removeDarkModeListener(this.autoDarkCallback);
  }

  autoDarkCallback(e: MediaQueryListEvent | MediaQueryList) {
    this.requestedDarkMode = e.matches;
  }

  shouldAllow(route: Route) {
    return shouldAllow(route);
  }

  get uwu() {
    return EventBus.uwufy;
  }

  get profile(): User | null {
    return Config.profile;
  }

  get drawer() {
    return Boolean(Config.settings.drawer);
  }

  set drawer(drawer: boolean) {
    Config.setDrawer(drawer);
    this.counter++;
    if (this.counter > 100 && !document.body.classList.contains('rb')) document.body.classList.add('rb');
  }

  get permanent() {
    return Boolean(Config.settings.permanentDrawer);
  }

  get mini() {
    return Boolean(Config.settings.mini);
  }

  set mini(mini: boolean) {
    Config.setMini(mini);
    if (!mini) this.drawer = true;
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
    return Config.settings.autoDark ? this.requestedDarkMode : Boolean(Config.settings.dark);
  }

  get noTransition() {
    return Boolean(Config.settings.noTransition);
  }

  get collections(): Collection[] {
    return Data.collections;
  }

  get mobile(): boolean {
    return this.$vuetify.breakpoint.mobile
  }

  get fontSize(): number {
    return Config.settings.fontSize || 16;
  }

  toggleDark() {
    const target = !Config.settings.dark;
    if (Config.settings.autoDark) Config.updateSettings({...Config.settings, autoDark: false});
    Config.setDark(target);
  }

  @Watch('dark')
  onDarkChange(val: boolean) {
    this.$vuetify.theme.dark = val;
  }

  @Watch('noTransition', {immediate: true})
  onTransitionPreferenceChange(val: boolean) {
    (val ? document.body.classList.add("no-transition") : document.body.classList.remove("no-transition"));
  }

  @Watch('fontSize', {immediate: true})
  onFontSizeChange(val: number) {
    document.documentElement.style.fontSize = `${val}px`;
  }

  logout() {
    Config.logout();
  }

  readonly touchOptions = {
    right: () => this.drawer = true,
    left: () => this.drawer = false
  };
}
</script>
<style lang="scss">
.markdown-body {
  color: inherit !important;
}

.v-application code {
  background-color: unset !important;
}

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

@import url('https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap');
.v-application.uwu {
  font-family: 'Indie Flower', cursive;

  .text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6, .text-subtitle-1, .text-subtitle-2, .text-body-1, .text-body-2, .text-button, .text-caption, .text-overline {
    font-family: 'Indie Flower', cursive !important;
  }
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

.no-transition * {
  transition: none !important;
}
</style>