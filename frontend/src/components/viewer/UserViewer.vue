<template>
  <v-container>
    <v-scroll-y-transition mode="out-in">
      <v-card :loading="saving" :disabled="saving" :key="uid" flat class="mt-6">
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
              <span v-if="ti&&ti.title" v-text="ti.title" class="mr-1 font-weight-bold"></span>
              <v-text-field label="Name" v-if="editing" v-model="editedUser.name" hide-details outlined flat>
              </v-text-field>
              <span v-else v-text="user.name"></span>
            </h3>
            <div class="info--text mb-2">
              <pre v-text="uid"></pre>
            </div>
            <div class="info--text mb-2">
              <v-text-field label="Email" v-if="editing" v-model="editedUser.email" hide-details outlined dense flat
                            disabled>
              </v-text-field>
              <span v-else v-text="user.email"></span>
            </div>
            <div class="info--text mb-2 subheading" v-if="user.nickname">
              <v-text-field label="Nickname" v-if="editing" v-model="editedUser.nickname" hide-details outlined flat
                            dense>
              </v-text-field>
              <span v-else v-text="user.nickname"></span>
            </div>
            <div class="mb-2 subheading" v-if="user.desc">
              <v-textarea label="Description" v-if="editing" v-model="editedUser.desc" hide-details outlined flat dense>
              </v-textarea>
              <span v-else v-text="user.desc"></span>
            </div>
            <div class="mb-2 subheading" v-if="isAdmin()">
              <strong>Last Login: </strong><span v-text="user.lastLogin"></span><br>
              <strong>Created: </strong><span v-text="user.created"></span>
            </div>
            <div class="error--text align-center" v-if="user.admin||editing">
              <v-checkbox v-if="editing" dense hide-details label="Admin" v-model="editedUser.admin"
                          style="margin-left:50%;transform:translateX(-50%);width:5em;"/>
              <span v-else>Admin</span>
            </div>
          </v-card-text>
          <v-divider v-if="ti"></v-divider>
          <v-card-text v-if="ti" class="text-center">
            <div v-if="ti.department_name" class="d-flex justify-center">
              <h5 class="mr-2">Department</h5>
              <span v-text="ti.department_name"></span>
            </div>
            <div v-if="ti.designation" class="d-flex justify-center">
              <h5 class="mr-2">Designation</h5>
              <span v-text="ti.designation"></span>
            </div>
            <div v-if="ti.subjects_name">
              <v-chip-group show-arrows class="justify-center" style="margin: -0.4em 0;">
                <v-spacer></v-spacer>
                <v-chip class="px-2" v-for="(s,i) in ti.subjects_name.split(/,\s?/g)" :key="i" v-text="s" x-small label>
                </v-chip>
                <v-spacer></v-spacer>
              </v-chip-group>
            </div>
          </v-card-text>
          <v-divider v-if="isAdmin()"></v-divider>
          <v-row
              v-if="isAdmin()"
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
              <template v-else>
                <v-chip :key="p" label small class="mr-2 mt-2"
                        v-for="[n,p] in perms.filter(t=>!this.permOverwrites.find(o=>t[0]===o[0]))" v-text="n"></v-chip>
                <v-chip :key="p" label small class="mr-2 mt-2 font-italic" color="primary"
                        v-for="[n,p] in permOverwrites" v-text="n"></v-chip>
              </template>
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
                          v-for="r in user.roles.filter(role=>!allRoles.includes(role))" v-text="r"/>
                </v-chip-group>
                <v-text-field class="mt-2" hide-details dense label="Custom Role" @keydown.enter="addRole"
                              v-model="roleToAdd"/>
              </template>
              <v-chip v-else :key="r" label small class="mr-2 mt-1" v-for="r in user.roles" v-text="r"/>
            </v-col>
            <v-col cols="12" sm="9" md="7" lg="6" v-else><i>None</i></v-col>
            <v-col cols="12">
              <PermissionEditor v-model="editedPermissions" :editing="editing"
                                no-data="No permission overrides set for this user"></PermissionEditor>
            </v-col>
          </v-row>
          <v-card-actions v-if="isAdmin()">
            <v-spacer/>
            <v-btn v-if="editing" text @click="editing=false">Cancel</v-btn>
            <v-btn :color="editing?'success':'primary'" text @click="!editing?editing=true:save()"
                   v-text="editing?'Save':'Edit'"></v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </v-scroll-y-transition>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {permissions, User} from '@/types/user';
import {computeAccess, hasPermission, splitAccess} from "@/mixins/permission";
import {post} from "@/mixins/api";
import Data from "@/store/data"
import PermissionEditor from "@/components/PermissionEditor.vue";
import {Teacher} from "@/types/teachers";

@Component({
  components: {PermissionEditor}
})
export default class UserViewer extends Vue {
  @Prop(String) readonly uid?: string;
  readonly name = "UserViewer";
  loading = false;
  saving = false;
  editing = false;
  editedUser: User = {} as User;
  editedAccess: number[] = []
  editedPermissions: { cid: string, allow: number | boolean }[] = []

  customRoles: string[] = [];

  roleToAdd = "";

  readonly permissions = permissions;

  created() {
    this.onUIDChange();
    Data.fetchRoles();
  }

  @Watch('uid', {immediate: true})
  onUIDChange() {
    if (!this.uid) return;
    this.loading = true;
    this.editing = false;
    this.saving = false;
    Data.fetchUser(this.uid).then(() => {
      this.loading = false;
    }).catch(() => {
      this.$router.push({name: "Users"});
      this.loading = false;
    })
  }

  @Watch('user')
  onUserChange() {
    if (!this.user) return;
    document.title = this.user.name || this.uid || 'Users';
    this.editedUser = {...this.user};
    this.editedAccess = splitAccess(this.user.access || 0);
    this.editedPermissions = this.user.permissions ? Object.keys(this.user.permissions).map(cid => ({
      cid,
      allow: this.user?.permissions[cid]
    })) : [];
  }

  get perms() {
    return Object.entries(permissions).filter(([, p]) => hasPermission(computeAccess(this.user), p));
  }

  get permOverwrites() {
    return Object.entries(permissions).filter(([, p]) => hasPermission(this.user?.access || 0, p));
  }

  save() {
    this.saving = true;
    this.editedUser.access = this.editedAccess.reduce((a, b) => a | b, 0);
    this.editedUser.permissions = Object.fromEntries(this.editedPermissions.map(node => [node.cid, node.allow]));
    post<{ user: User }>(`/api/users/${this.uid}`, {
      name: this.editedUser.name,
      nick: this.editedUser.nickname,
      desc: this.editedUser.desc,
      roles: this.editedUser.roles,
      admin: this.editedUser.admin,
      access: this.editedUser.access,
      teacher: this.editedUser.teacher,
      permissions: this.editedUser.permissions
    }).then(json => {
      this.editing = false;
      if (!this.uid) return;
      Data.setUser({uid: this.uid, user: json.user});
      Data.setCurrentUser(json.user || null);
    }).catch(err => {
      alert(err)
    }).finally(() => this.saving = false)
  }

  addRole() {
    if (!this.roleToAdd) return;
    if (this.customRoles.includes(this.roleToAdd)) return;
    this.customRoles.push(this.roleToAdd);
    this.editedUser.roles.push(this.roleToAdd);
    this.roleToAdd = "";
  }

  readonly teacherItems = [{text: "Teacher", value: true}, {text: "Student", value: false}]

  get user(): User & { teacherInfo?: Teacher } {
    return Data.currentUser || {} as (User & { teacherInfo?: Teacher });
  }

  get ti(): Teacher | undefined {
    return this.user.teacherInfo;
  }

  get allRoles() {
    return this.customRoles.concat(Data.roles.map(r => r.rid));
  }
}
</script>