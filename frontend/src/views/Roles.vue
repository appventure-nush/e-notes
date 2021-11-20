<template>
  <v-row style="height:calc(100vh - 64px);" no-gutters>
    <v-col style="max-height:100%;width:300px;min-width:300px;" class="d-flex flex-column flex-grow-0">
      <v-card class="flex-grow-0 pa-2" :flat="!query" tile>
        <v-text-field v-model="query"
                      placeholder="Search..." dense flat prepend-icon="mdi-magnify" hide-details="auto"></v-text-field>
      </v-card>
      <v-list-item-group v-model="selected" class="flex-grow-1" style="overflow-y:auto;">
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
      </v-list-item-group>
    </v-col>
    <v-col style="max-height:100%;overflow-y:auto">
      <router-view :roles="roles" :creating="!$route.params.rid"></router-view>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {cached, storeTo} from "@/store";
import {Role} from "@/types/role";
import {EventBus} from "@/event";

@Component
export default class Roles extends Vue {
  name = "Roles"
  loading = true
  selected = "";
  query = "";

  creating = false;

  get roles(): Role[] {
    return this.$store.state.currentRoles;
  }

  created() {
    cached("getRoles").then(json => storeTo("setCurrentRoles", json))
    EventBus.$on('needRoleUpdate', (callback?: () => void) => {
      cached("getRoles").then(json => {
        storeTo("setCurrentRoles", json);
        if (callback) callback();
      })
    });
    EventBus.$on('newRoleRequested', () => {
      this.$router.push({name: 'New Role'});
    })
  }

  get hasSelected() {
    return !!this.selected;
  }

  get displayedRoles() {
    let result = this.roles;
    if (this.query) result = result.filter(u => u.rid?.toUpperCase().includes(this.query.toUpperCase()) || u.name?.toUpperCase().includes(this.query.toUpperCase()) || u.desc?.toUpperCase().includes(this.query.toUpperCase()))
    return result;
  }
}
</script>

<style scoped>

</style>