<template>
  <div>
    <v-navigation-drawer v-model="drawer" absolute color="background">
      <v-text-field v-model="query" class="ma-2 mb-0" placeholder="Search..." dense flat prepend-icon="mdi-magnify"
                    hide-details="auto"></v-text-field>
      <v-list-item :key="role.rid" v-for="role in displayedRoles" :to="{name:'Role',params:{rid:role.rid}}"
                   :value="role.rid" two-line>
        <v-list-item-content>
          <v-list-item-title v-text="role.name"></v-list-item-title>
          <v-list-item-subtitle>
            <pre v-text="role.rid"></pre>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="displayedRoles.length===0" two-line>
        <v-list-item-content>
          <v-list-item-title>
            <i>None</i>
          </v-list-item-title>
          <v-list-item-subtitle>No role found</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

    </v-navigation-drawer>
    <v-main class="pt-1 ml-1 overflow-y-auto"
            :style="{paddingLeft:drawer&&$vuetify.breakpoint.lgAndUp?'256px':'0px',maxHeight,height:maxHeight}">
      <v-btn icon @click="drawer=!drawer" absolute>
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <router-view :roles="roles"></router-view>
    </v-main>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Data from "@/store/data"
import {Role} from "@/types/role";
import {EventBus} from "@/event";

@Component
export default class Roles extends Vue {
  name = "Roles"
  drawer = true
  loading = true
  selected = "";
  query = "";

  get roles(): Role[] {
    return Data.roles || [];
  }

  created() {
    Data.fetchRoles();
    EventBus.$on('needRoleUpdate', (callback?: () => void) => Data.fetchRoles().then(() => {
      if (callback) callback();
    }));
    EventBus.$on('newRoleRequested', () => this.$router.push({name: 'New Role'}))
  }

  get hasSelected() {
    return !!this.selected;
  }

  get displayedRoles() {
    let result = this.roles;
    if (this.query) result = result.filter(u => u.rid?.toUpperCase().includes(this.query.toUpperCase()) || u.name?.toUpperCase().includes(this.query.toUpperCase()) || u.desc?.toUpperCase().includes(this.query.toUpperCase()))
    return result;
  }

  get maxHeight() {
    const {bottom, footer, bar, top} = this.$vuetify.application;
    const heightRest = bottom + footer + bar + top;
    return `calc(100vh - ${heightRest}px)`;
  }
}
</script>

<style scoped>

</style>