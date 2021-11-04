<template>
  <v-container>
    <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        class="elevation-1"
    ></v-data-table>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class Users extends Vue {
  name = "Users"
  loading = true
  headers = [
    {
      text: 'Name',
      align: 'start',
      value: 'name',
    },
    {text: 'Email', value: 'email'},
    {text: 'Verified', value: 'verified'},
    {text: 'Teacher', value: 'teacher'},
    {text: 'Admin', value: 'admin'}
  ]
  users = []

  mounted() {
    this.loading = true;
    this.$store.cache.dispatch('getUsers').then(res => {
      this.loading = false;
      return this.users = res;
    });
  }
}
</script>

<style scoped>

</style>