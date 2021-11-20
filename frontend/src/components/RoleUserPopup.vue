<template>
  <v-dialog
      v-model="dialog"
      max-width="600px"
      :fullscreen="$vuetify.breakpoint.xsOnly">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" text v-bind="attrs" v-on="on" v-show="show">Edit users</v-btn>
    </template>
    <v-card>
      <v-card-title>{{ action === 'add' ? 'Grant' : action === 'remove' ? 'Revoke' : 'Grant/Revoke' }} Roles
      </v-card-title>
      <v-card-text
          v-if="errorMsg">
        <v-alert
            elevation="5"
            type="error"
        >{{ errorMsg }}
        </v-alert>
      </v-card-text>
      <v-card-text>
        <v-form @submit.prevent="submit" id="role-users-popup-form" ref="role-user-popup-form">
          <v-select v-model="action" :items="items" :rules="requiredRules"></v-select>
          <v-textarea outlined v-model="emailsString" label="Emails" required :rules="requiredRules"
                      hint="Seperated by any means that does not confuse existing email strings, or change the way emails are shown"></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn text color="primary" type="submit" form="role-users-popup-form">
          Execute
        </v-btn>
        <v-btn text @click="dialog=false">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue} from "vue-property-decorator";
import {VForm} from "@/shims-vuetify";

@Component
export default class RoleUserPopup extends Vue {
  @Prop(String) readonly rid!: string;
  @Prop(Boolean) readonly show!: boolean;
  @Ref('role-user-popup-form') readonly form!: VForm;

  name = "RoleUserPopup"
  dialog = false;
  action = ""
  emailsString = ""

  errorMsg = "";

  submit() {
    if (this.form.validate()) {
      this.$emit('emails', this.extractEmails(this.emailsString));
      this.dialog = false;
    }
  }

  extractEmails(text: string) {
    return text.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
  }

  readonly requiredRules = [
    (v: string) => !!v || 'This is required',
  ]
  readonly items = [
    {
      text: "Grant",
      value: "add"
    },
    {
      text: "Revoke",
      value: "remove"
    }
  ];
}
</script>

<style scoped>

</style>