<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        {{ name === "" ? "Sign In" : `Welcome, ${name}!` }}
        <v-spacer/>
      </v-card-title>
      <v-form class="ma-4">
        <v-text-field
          v-model="name"
          label="Name"
          required
        />
        <MGSelect
          @update="$data.mentorGroup = $event"
        />
        <v-btn
          class="my-4"
          @click="signIn()"
          :disabled="!(name && mentorGroup)"
          color="success">
          Sign In
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import MGSelect from "@/components/MGSelect.vue";

export default Vue.extend({
  name: "SignIn",
  components: {
    MGSelect
  },
  data() {
    return {
      name: "",
      mentorGroup: null,
    };
  },

  methods: {
    signIn() {
      const user = {
        name: this.$data.name,
        mentorGroup: this.$data.mentorGroup,
      };
      localStorage.setItem("user", JSON.stringify(user));
      this.$store.state.user = user;
      this.$router.push("/");
    }
  },
});
</script>
