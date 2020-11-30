<template>
  <v-card>
    <v-tabs
      color="deep-blue accent-4"
      right>
      <v-tab>User</v-tab>
      <v-tab>Role</v-tab>
<!--      <v-tab>Collections</v-tab>-->

      <v-tab-item
        key="user">
        <v-container fluid>
          <user-management></user-management>
        </v-container>
      </v-tab-item>
      <v-tab-item
        key="role">
        <v-container fluid>
          <role-management></role-management>
        </v-container>
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import UserManagement from "../components/UserManagement.vue";
import RoleManagement from "../components/RoleManagement.vue";

type User = {
  uid: string;
  name: string;
  email: string;
  pfp: string;
};

export default Vue.extend({
  components: {
    "role-management": RoleManagement,
    "user-management": UserManagement
  }
});
</script>

