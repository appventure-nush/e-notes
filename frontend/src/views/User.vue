<template>
  <v-container>
    <v-scroll-y-transition mode="out-in">
      <v-card :loading="saving" :key="uid" flat class="mt-6">
        <template v-if="loading">
          <v-card-text>
            <v-skeleton-loader type="list-item-avatar,divider,card"></v-skeleton-loader>
          </v-card-text>
        </template>
        <template v-else>
          <v-card-text class="text-center">
            <v-avatar size="88" class="mb-6">
              <v-img :src="user.pfp||'/images/guest.png'"></v-img>
            </v-avatar>
            <h3 class="text-h5 mb-2">
              {{ user.name }}
            </h3>
            <div class="blue--text mb-2">
              {{ user.email }}
            </div>
            <div class="blue--text mb-2 subheading" v-if="user.nickname">
              {{ user.nickname }}
            </div>
            <div class="red--text align-center" v-if="user.admin||editing">
              <v-checkbox v-if="editing" dense hide-details label="Admin" v-model="editedUser.admin"
                          style="margin-left:50%;transform:translateX(-50%);width:5em;"/>
              <span v-else>Admin</span>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-row
              class="text-left"
              tag="v-card-text">
            <v-col
                :class="[this.$vuetify.breakpoint.xs?'':'text-right']"
                tag="strong"
                cols="12" sm="3" md="5" lg="6">
              Type:
            </v-col>
            <v-col cols="12" sm="9" md="7" lg="6">
              <v-select class="mt-0" hide-details dense v-if="editing" v-model="editedUser.teacher"
                        :items="teacherItems" item-text="text" item-value="value"/>
              <span v-text="user.teacher ? 'Teacher' : 'Student'" v-else></span>
            </v-col>

            <v-col
                :class="[this.$vuetify.breakpoint.xs?'':'text-right']"
                tag="strong"
                cols="12" sm="3" md="5" lg="6">
              Permissions:
            </v-col>
            <v-col cols="12" sm="9" md="7" lg="6" v-if="editing||perms.length>0" class="pt-1">
              <template v-if="editing">
                <v-checkbox dense hide-details v-for="(v,n) in permissions" :key="v" v-model="editedAccess"
                            :label="n" :value="v"/>
              </template>
              <v-chip v-else :key="p" label small class="mr-2 mt-2" v-for="[n,p] in perms" v-text="n"/>
            </v-col>
            <v-col cols="12" sm="9" md="7" lg="6" v-else><i>None</i></v-col>

            <v-col
                :class="[this.$vuetify.breakpoint.xs?'':'text-right']"
                tag="strong"
                cols="12" sm="3" md="5" lg="6">
              Roles:
            </v-col>
            <v-col cols="12" sm="9" md="7" lg="6" v-if="editing||(user.roles&&user.roles.length>0)" class="pt-2">
              <template v-if="editing">
                <v-chip-group v-model="editedUser.roles" column multiple active-class="primary--text">
                  <v-chip class="mt-0" :key="r" label small :value="r" v-for="r in allRoles" v-text="r"/>
                  <v-chip class="mt-0" :key="r" label small :value="r"
                          v-for="r in user.roles.filter(r=>!allRoles.includes(r))" v-text="r"/>
                </v-chip-group>
                <v-text-field class="mt-2" hide-details dense label="Custom Role" @keydown.enter="addRole"
                              v-model="roleToAdd"/>
              </template>
              <v-chip v-else :key="r" label small class="mr-2 mt-1" v-for="r in user.roles" v-text="r"/>
            </v-col>
            <v-col cols="12" sm="9" md="7" lg="6" v-else><i>None</i></v-col>
          </v-row>
          <v-card-actions>
            <v-spacer/>
            <v-btn :color="editing?'success':'primary'" text @click="!editing?editing=true:save()"
                   v-text="editing?'Save':'Edit'"></v-btn>
            <v-spacer v-if="$vuetify.breakpoint.lg"/>
          </v-card-actions>
        </template>
      </v-card>
    </v-scroll-y-transition>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {permissions, User} from '@/types/user';
import {Role} from "@/types/role";
import {computeAccess, hasPermission} from "@/mixins/permission";

@Component
export default class UserView extends Vue {
  @Prop(String) readonly uid?: string;
  readonly name = "UserView";
  loading = false;
  saving = false;
  editing = false;
  user: User = {} as User;
  editedUser: User = {} as User;
  editedAccess = []

  allRoles: string[] = [];

  roleToAdd = "";

  readonly permissions = permissions;

  mounted() {
    this.onUIDChange();
    this.$store.cache.dispatch('getRoles').then((roles: Role[]) => this.allRoles = roles.map(r => r.rid));
  }

  @Watch('uid')
  onUIDChange() {
    this.loading = true;
    this.editing = false;
    this.saving = false;
    this.$store.cache.dispatch('getUser', this.uid).then((user: User) => {
      this.user = user;
      this.editedUser = {...user};
      this.loading = false;
    });
  }

  get perms() {
    return Object.entries(permissions).filter(([, p]) => hasPermission(computeAccess(this.user), p));
  }

  save() {
    Object.assign(this.user, this.editedUser);
    this.editing = false;
  }

  addRole() {
    if (!this.roleToAdd) return;
    if (this.allRoles.includes(this.roleToAdd)) return;
    this.allRoles.push(this.roleToAdd);
    this.editedUser.roles.push(this.roleToAdd);
    this.roleToAdd = "";
  }

  readonly teacherItems = [{text: "Teacher", value: true}, {text: "Student", value: false}]
}
</script>

<style scoped>

</style>