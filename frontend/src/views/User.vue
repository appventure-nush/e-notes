<template>
  <v-container>
    <v-card :loading="loading">
      <template v-if="loading">
        <v-card-text>
          <v-skeleton-loader type="list-item-avatar,divider,card"></v-skeleton-loader>
        </v-card-text>
      </template>
      <template v-else>
        <v-list-item two-line>
          <v-list-item-avatar>
            <v-avatar>
              <v-img :src="user.pfp||'/images/guest.png'"/>
            </v-avatar>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="user.name"></v-list-item-title>
            <v-list-item-subtitle v-text="user.email"></v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon>
              <v-icon color="grey lighten-1">mdi-information</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-card-text>
          <v-chip-group>
            <v-chip v-for="role in user.roles" :key="role">{{ role }}</v-chip>
          </v-chip-group>
          <v-autocomplete
              v-model="roles"
              :items="allRoles"
              chips
              label="Roles"
              full-width
              multiple
              single-line
          ></v-autocomplete>
        </v-card-text>
      </template>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {User} from '@/types/user';
import {Role} from "@/types/role";

@Component
export default class UserView extends Vue {
  @Prop(String) readonly uid?: string;
  name = "UserView";
  loading = false;
  user: User = {} as User;
  allRoles: string[] = [];
  roles: string[] = [];

  mounted() {
    this.onUIDChange();
    this.$store.dispatch('getRoles').then((roles: Role[]) => this.allRoles = roles.map(r => r.rid));
  }

  @Watch('uid')
  onUIDChange() {
    this.loading = true;
    this.$store.cache.dispatch('getUser', this.uid).then((user: User) => {
      this.user = user;
      this.roles = user.roles;
      this.loading = false;
    });
  }
}
</script>

<style scoped>

</style>