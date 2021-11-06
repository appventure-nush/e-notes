<template>
  <v-row style="height:calc(100vh - 64px);" no-gutters>
    <v-col cols="12" sm="4" md="3" style="max-height:100%;" class="d-flex flex-column">
      <v-card class="flex-grow-0 pa-2">
        <v-text-field v-model="query"
                      placeholder="Search..." dense flat prepend-icon="mdi-magnify" hide-details="auto"></v-text-field>
      </v-card>
      <v-list-item-group v-model="selected" class="flex-grow-1" style="overflow-y:auto;">
        <v-list-item :key="user.uid" v-for="user in displayedUsers" :to="{name:'User',params:{uid:user.uid}}"
                     :value="user.uid" two-line>
          <v-list-item-avatar>
            <v-avatar>
              <v-img :src="user.pfp||'/images/guest.png'"/>
            </v-avatar>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="user.name"></v-list-item-title>
            <v-list-item-subtitle v-text="user.email"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-col>
    <v-col cols="12" sm="8" md="9" style="max-height:100%; overflow-y: auto">
      <router-view></router-view>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {User} from "@/types/user";

@Component
export default class Users extends Vue {
  name = "Users"
  loading = true
  users: User[] = []
  selected = "";
  query = "";

  get hasSelected() {
    return !!this.selected;
  }

  mounted() {
    this.loading = true;
    this.$store.cache.dispatch('getUsers').then(res => {
      this.loading = false;
      this.users = res;

    });
  }

  get displayedUsers() {
    let result = this.users;
    if (this.query) result = result.filter(u => u.uid?.includes(this.query) || u.name?.toUpperCase().includes(this.query.toUpperCase()) || u.email?.includes(this.query))
    return result;
  }
}
</script>

<style scoped>

</style>