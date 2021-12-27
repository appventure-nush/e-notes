<template>
  <v-container>
    <v-text-field filled hint="UID or Email or Name" label="Search" prepend-inner-icon="mdi-magnify"
                  v-model="queryString"></v-text-field>
    <v-list-group prepend-icon="mdi-school-outline" v-if="teachers.length>0">
      <template v-slot:activator>
        <v-list-item-title>Teachers</v-list-item-title>
      </template>
      <UserStrip :user="user" v-for="user in teachers" :to="{name:'User', params:{uid:user.uid}}"
                 :key="user.uid"></UserStrip>
    </v-list-group>
    <v-list-group prepend-icon="mdi-bread-slice-outline" v-if="students.length>0">
      <template v-slot:activator>
        <v-list-item-title>Students</v-list-item-title>
      </template>
      <UserStrip :user="user" v-for="user in students" :to="{name:'User', params:{uid:user.uid}}"
                 :key="user.uid"></UserStrip>
    </v-list-group>
  </v-container>
</template>
<script lang="ts">
import {Component, ModelSync, Prop, Vue} from "vue-property-decorator";
import {User} from "@/types/user";
import UserStrip from "@/components/viewer/UserStrip.vue";

@Component({
  components: {UserStrip}
})
export default class UsersViewer extends Vue {
  @Prop(Array) readonly shownUsers!: User[];
  @ModelSync('value', 'change', {type: String})
  readonly queryString!: string;

  get teachers() {
    return this.shownUsers.filter(u => u.teacher);
  }

  get students() {
    return this.shownUsers.filter(u => !u.teacher);
  }
}
</script>