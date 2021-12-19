<template>
  <v-menu bottom min-width="200px" rounded offset-y>
    <template v-slot:activator="{ on }">
      <v-btn icon :width="size" :height="size" v-on="on" :class="classes" :elevation="elevation">
        <v-avatar :color="user.pfp?undefined:getHashCode(user.name)" :size="size">
          <v-img :src="user.pfp" v-if="user.pfp"></v-img>
          <span class="white--text text-h5" v-else>{{ initials(user.name) }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-list-item-content class="justify-center">
        <div class="mx-auto text-center">
          <v-avatar :color="user.pfp?undefined:getHashCode(user.name)" class="mb-2">
            <v-img :src="user.pfp" v-if="user.pfp"></v-img>
            <span class="white--text text-h5" v-else>{{ initials(user.name) }}</span>
          </v-avatar>
          <h3 class="px-2">
            <router-link :to="{name:'User',params:{uid:uid}}">{{ user.name || user.uid }}</router-link>
          </h3>
          <div class="text-caption mt-1 px-2">
            {{ user.email }}
          </div>
          <div class="text-caption mt-1 px-2" v-if="this.$slots.additional">
            <slot name="additional"></slot>
          </div>
        </div>
      </v-list-item-content>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {User} from "@/types/user";
import Data from "@/store/data"
import {get} from "@/mixins/api";
import {auth} from "@/plugins/firebase";

@Component
export default class UserAvatar extends Vue {
  @Prop(String) readonly uid!: string;
  @Prop({type: Boolean, default: false}) readonly admin!: boolean;
  @Prop({type: Number, default: 46}) readonly size!: number;
  @Prop(String) readonly classes!: string;
  @Prop({type: Number, default: 0}) readonly elevation!: number;
  name = "UserAvatar"
  user: User = {} as User;

  @Watch('uid', {immediate: true})
  async onUIDChange() {
    let user = Data.users.find(u => u.uid === this.uid) || null;
    if (user?.name) {
      this.user = user;
      return;
    }
    user = await get<User>(`/api/users/${this.uid}`).catch(() => null)
    if (user) {
      Data.setUser({uid: this.uid, user});
      this.user = user;
      return;
    }
    if (this.admin) this.user = {
      permissions: {},
      admin: true,
      name: "Admin",
      pfp: "/images/admin.jpg",
      roles: [],
      teacher: true,
      uid: "0"
    };
    else this.user = {
      permissions: {},
      admin: false,
      name: "Deleted User",
      roles: [],
      teacher: false,
      uid: "deleted"
    };
  }
}
</script>

<style scoped>

</style>