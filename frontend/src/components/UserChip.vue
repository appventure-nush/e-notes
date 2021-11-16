<template>
  <div>
    <v-card v-if="user" outlined elevation="0">
      <v-list-item class="grow">
        <v-list-item-avatar color="grey darken-3">
          <v-img
              lazy-src="/images/guest.png"
              :src="user.pfp||'/images/guest.png'"
          ></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-text="user.name"></v-list-item-title>
          <slot name="additional"></slot>
        </v-list-item-content>
      </v-list-item>
    </v-card>
    <v-skeleton-loader v-else type="list-item-avatar"></v-skeleton-loader>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {User} from "@/types/user";
import {cached} from "@/store";

@Component
export default class UserChip extends Vue {
  @Prop(String) readonly uid: string | undefined

  @Prop(Boolean) readonly admin: boolean | undefined
  name = "UserChip"
  user: User | null = null;

  mounted() {
    this.updateDisplay(this.uid);
  }

  @Watch('uid')
  updateDisplay(uid?: string) {
    this.user = null;
    if (!uid) {
      if (this.admin) this.user = {
        name: "Admin",
        pfp: "/images/admin.jpg",
        admin: true
      } as User;
      return;
    }
    cached("getUser", uid).then(res => {
      if (res.status && res.status !== "success") return;
      this.user = res;
    })
  }
}
</script>

<style scoped>

</style>