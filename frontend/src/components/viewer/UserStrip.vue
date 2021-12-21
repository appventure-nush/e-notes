<template>
  <v-list-item :to="{name:'User', params:{uid:user.uid}}" :key="user.uid">
    <v-list-item-avatar>
      <v-avatar :color="getHashCode(user.name)">
        <v-img :src="user.pfp" v-if="user.pfp"/>
        <span class="white--text text-h5" v-else>{{ initials(user.name) }}</span>
      </v-avatar>
    </v-list-item-avatar>
    <v-list-item-title>{{ user.name }}</v-list-item-title>
  </v-list-item>
</template>
<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {User} from "@/types/user";

@Component
export default class UserStrip extends Vue {
  @Prop(Object) readonly user!: User;
}
</script>