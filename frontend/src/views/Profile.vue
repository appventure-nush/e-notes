<template>
  <v-container fluid>
    <v-card>
      <v-col class="mx-auto" max-width="434" tile>
        <v-avatar size="100" style="position:absolute; top: 130px">
          <v-img src="{{ user.photoURL }}"></v-img>
        </v-avatar>
      </v-col>
      <v-list-item color="rgba(0, 0, 0, .4)">
        <v-list-item-content>
          <v-list-item-title class="title">{{ user.displayName }}</v-list-item-title>
          <v-list-item-subtitle>student/teacher</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

    </v-card>
  </v-container>
</template>


<script lang="ts">
import Vue from "vue";
import {auth} from "@/firebase";

export default Vue.extend({
  name: "Profile",
  data: ()=> ({
    user: auth.currentUser
  })
})
</script>
