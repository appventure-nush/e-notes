<template>
  <v-menu bottom min-width="200px" rounded offset-y>
    <template v-slot:activator="{ on }">
      <v-btn icon :width="size" :height="size" v-on="on">
        <v-avatar color="brown" :size="size">
          <v-img :src="user.pfp" v-if="user.pfp"></v-img>
          <span class="white--text text-h5" v-else>{{ initials(user.name) }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-list-item-content class="justify-center">
        <div class="mx-auto text-center">
          <v-avatar color="brown" class="mb-2">
            <v-img :src="user.pfp" v-if="user.pfp"></v-img>
            <span class="white--text text-h5" v-else>{{ initials(user.name) }}</span>
          </v-avatar>
          <h3>
            <router-link :to="{name:'User',params:{uid:uid}}">{{ user.name }}</router-link>
          </h3>
          <div class="text-caption mt-1">
            {{ user.email }}
          </div>
        </div>
      </v-list-item-content>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {User} from "@/types/user";

@Component
export default class UserAvatar extends Vue {
  @Prop(String) readonly uid!: string;
  @Prop({type: Number, default: 50}) readonly size!: number;
  name = "UserAvatar"
  user: User = {} as User;

  @Watch('uid', {immediate: true})
  onUIDChange() {
    this.$store.cache.dispatch('getUser', this.uid).then(user => this.user = user);
  }
}
</script>

<style scoped>

</style>