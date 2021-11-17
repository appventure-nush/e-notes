<template>
  <v-menu bottom min-width="200px" rounded offset-y>
    <template v-slot:activator="{ on }">
      <v-btn icon :width="size" :height="size" v-on="on" :class="classes">
        <v-avatar :color="getHashCode(user.name)" :size="size">
          <v-img :src="user.pfp" v-if="user.pfp"></v-img>
          <span class="white--text text-h5" v-else>{{ initials(user.name) }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-list-item-content class="justify-center">
        <div class="mx-auto text-center">
          <v-avatar :color="getHashCode(user.name)" class="mb-2">
            <v-img :src="user.pfp" v-if="user.pfp"></v-img>
            <span class="white--text text-h5" v-else>{{ initials(user.name) }}</span>
          </v-avatar>
          <h3 class="px-2">
            <router-link :to="{name:'User',params:{uid:uid}}">{{ user.name }}</router-link>
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
import {cached} from "@/store";

function intToHSL(number: number) {
  return "hsl(" + number % 360 + ",50%,30%)";
}

@Component
export default class UserAvatar extends Vue {
  @Prop(String) readonly uid!: string;
  @Prop({type: Boolean, default: false}) readonly admin!: boolean;
  @Prop({type: Number, default: 46}) readonly size!: number;
  @Prop(String) readonly classes!: string;
  name = "UserAvatar"
  user: User = {} as User;

  @Watch('uid', {immediate: true})
  onUIDChange() {
    cached('getUser', this.uid).then(user => {
      this.user = user;
    }).catch(() => {
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
    });
  }

  getHashCode(string?: string) {
    if (!string) return 'brown';
    let hash = 0;
    if (string.length == 0) return hash;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    return intToHSL(hash);
  }
}
</script>

<style scoped>

</style>