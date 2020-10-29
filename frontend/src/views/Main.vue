<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Your profile
        <v-spacer/>
      </v-card-title>
      <v-card-text v-if="$store.state.user">
        <div class="ma-4">
          <div class="text-md-h6">
            Name: {{ $store.state.user.name }}
          </div>
          <div class="text-md-h6">
            Mentor group: {{ $store.state.user.mentorGroup }}
          </div>
        </div>

        <v-btn
          color="error"
          @click="signOut()"
        >
          Sign Out
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Main",
  methods:{
    signOut(){
      this.$store.state.user = null;
      localStorage.clear();
      this.$router.push("sign_in");
    }
  },
});
</script>
