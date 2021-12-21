<template>
  <div>
    <v-navigation-drawer v-if="!hideControls" v-model="drawer" absolute color="background">
      <v-text-field v-model="query" class="ma-2 mb-0" placeholder="Search..." dense flat prepend-icon="mdi-magnify"
                    hide-details="auto"></v-text-field>
      <v-list-item :key="user.uid" v-for="user in displayedUsers" :to="{name:'User',params:{uid:user.uid}}"
                   :value="user.uid" two-line>
        <v-list-item-avatar>
          <v-avatar :color="getHashCode(user.name)">
            <v-img :src="user.pfp" v-if="user.pfp"/>
            <span class="white--text text-h5" v-else>{{ initials(user.name) }}</span>
          </v-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-text="user.name"></v-list-item-title>
          <v-list-item-subtitle v-text="user.email"></v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="displayedUsers.length===0" two-line>
        <v-list-item-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>
            <i>None</i>
          </v-list-item-title>
          <v-list-item-subtitle>No user found</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-navigation-drawer>
    <v-main class="pt-1 ml-1 overflow-y-auto"
            :style="{paddingLeft:drawer&&$vuetify.breakpoint.lgAndUp&&!hideControls?'256px':'0px',maxHeight,height:maxHeight}">
      <v-btn v-if="!hideControls" icon @click="drawer=!drawer" absolute>
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <router-view :users="users"></router-view>
    </v-main>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Data from "@/store/data"

@Component
export default class Users extends Vue {
  name = "Users"
  drawer = true;
  query = "";

  get hideControls() {
    return this.$route.name === "Users";
  }

  created() {
    Data.fetchUsers();
  }

  get displayedUsers() {
    let result = this.users;
    if (this.query) result = result.filter(u => u.uid?.toUpperCase().includes(this.query.toUpperCase()) || u.name?.toUpperCase().includes(this.query.toUpperCase()) || u.email?.toUpperCase().includes(this.query.toUpperCase()))
    return result;
  }

  get users() {
    return Data.users;
  }

  get maxHeight() {
    const {bottom, footer, bar, top} = this.$vuetify.application;
    const heightRest = bottom + footer + bar + top;
    return `calc(100vh - ${heightRest}px)`;
  }
}
</script>