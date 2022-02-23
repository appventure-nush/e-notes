<template>
  <v-container>
    <v-scroll-y-transition mode="out-in">
      <v-card :loading="saving" :key="rid" flat class="mt-6" :disabled="saving">
        <template v-if="loading">
          <v-card-text>
            <v-skeleton-loader type="list-item-avatar,divider,card"></v-skeleton-loader>
          </v-card-text>
        </template>
        <template v-else>
          <v-card-title v-if="creating">Create Role</v-card-title>
          <v-card-title>
            <v-text-field :rules="INPUT_NAME_RULES" v-if="editing" v-model="editedRole.name"
                          label="Role Name"></v-text-field>
            <span v-text="role.name" v-else></span>
          </v-card-title>
          <v-card-subtitle>
            <v-text-field :rules="INPUT_ID_RULES" :disabled="!creating" v-if="editing" v-model="editedRole.rid"
                          label="Role ID"></v-text-field>
            <pre v-text="role.rid" v-else></pre>
          </v-card-subtitle>
          <v-card-text>
            <v-textarea v-if="editing" v-model="editedRole.desc" dense hide-details label="Description"></v-textarea>
            <template v-else>{{ role.desc }}</template>
          </v-card-text>
          <v-card-text class="py-0">
            <v-checkbox v-model="editedRole.defaultPerm" :readonly="!editing" dense hide-details persistent-hint
                        label="Default Permission" hint="Has full view access by default"></v-checkbox>
          </v-card-text>
          <v-card-text>
            <div><strong>Users with role</strong></div>
            <div v-if="creating">
              <v-chip class="ma-1" v-for="email of this.emailsWithRoles" :key="email" v-text="email"></v-chip>
            </div>
            <v-hover v-slot="{hover}" v-else>
              <div class="my-1">
                <UserAvatar :uid="user.uid" :size="46" classes="ma-1" :key="user.uid" v-for="user in usersWithRole||[]"
                            :elevation="hover?3:0"></UserAvatar>
              </div>
            </v-hover>
            <div v-if="showPlainEmail">
              <code v-text="this.usersWithRole.map(u=>u.email).join(', ')"></code>
            </div>
            <RoleUserPopup ref="users-popup" :rid="rid" :show="editing"></RoleUserPopup>
            <div v-if="role.pendingEmail&&role.pendingEmail.length>0">
              <h1 class="text-h5">Pending</h1>
              <pre v-text="role.pendingEmail.join('\n')"></pre>
            </div>
            <v-btn v-if="!editing&&!creating" text @click="showPlainEmail=!showPlainEmail">Toggle Plain</v-btn>
          </v-card-text>
          <PermissionEditor v-model="editedPermissions" :editing="editing"
                            no-data="No permission overrides set for this role"></PermissionEditor>
          <small v-if="editing">Note, edit permissions will not be respected for roles, will be regarded the same as
            view</small>
          <v-card-actions v-if="isAdmin()">
            <v-spacer/>
            <v-btn v-if="editing" text @click="cancel">Cancel</v-btn>
            <v-btn v-if="editing&&!creating" text color="error" @click="deleteRole">Delete</v-btn>
            <v-btn :color="editing?'success':'primary'" text @click="!editing?editing=true:save()"
                   v-text="editing?'Save':'Edit'"></v-btn>
          </v-card-actions>
        </template>
      </v-card>
    </v-scroll-y-transition>
  </v-container>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import {Role} from "@/types/role";
import {del, get, post} from "@/mixins/api";
import UserAvatar from "@/components/UserAvatar.vue";
import RoleUserPopup from "@/components/popup/RoleUserPopup.vue";
import {EventBus} from "@/event";
import Data from "@/store/data"
import PermissionEditor from "@/components/PermissionEditor.vue";
import {User} from "@/types/user";

@Component({
  components: {PermissionEditor, RoleUserPopup, UserAvatar}
})
export default class RoleViewer extends Vue {
  @Prop(String) readonly rid!: string;
  @Prop(Array) readonly roles!: Role[];

  @Ref('users-popup') readonly usersPopup!: RoleUserPopup;
  readonly name = "RoleViewer";
  loading = false;
  saving = false;
  editing = false;
  showPlainEmail = false;
  editedRole: Role = {} as Role;
  usersWithRole: User[] = [];
  editedPermissions: { cid: string, allow: number | boolean }[] = []

  // for creation only
  emailsWithRoles: string[] = [];

  mounted() {
    this.usersPopup.$on('emails', (emails: string[]) => {
      if (!this.creating) {
        this.saving = true;
        post<{ updated: number, users: User[], role: Role }>(`/api/roles/${this.rid}/users`, {
          action: this.usersPopup.action,
          emails: emails
        }).then(json => {
          Data.setRole({rid: json.role.rid, role: json.role});
          console.log("Updated users count", json.updated);
          this.usersWithRole = json.users;
        }).catch(e => alert(e)).finally(() => this.saving = false)
      } else {
        console.log(emails);
        this.emailsWithRoles = emails;
        if (this.usersPopup.action === 'add') this.emailsWithRoles.push(...emails.filter(e => !this.emailsWithRoles.includes(e)))
        else this.emailsWithRoles = this.emailsWithRoles.filter(e => !emails.includes(e));
      }
    });
  }

  @Watch('rid', {immediate: true})
  onRIDChange() {
    this.editing = false;
    this.saving = false;
    if (this.creating) {
      this.editing = true;
      this.editedRole = {} as Role;
      this.editedPermissions = [];
      return;
    }
    let role = this.roles.find(r => r.rid === this.rid);
    if (!role) return this.$router.push({name: "Roles"});
    Data.setCurrentRole(role);
    get<User[]>(`/api/roles/${this.rid}/users`).then(json => this.usersWithRole = json);
  }

  @Watch('roles', {immediate: true, deep: true})
  onRolesChange() {
    this.onRIDChange();
  }

  @Watch('role', {immediate: true})
  onRoleChange() {
    if (this.creating) return;
    if (!this.role) return;
    document.title = this.role.name || this.rid || 'Roles';
    this.editedRole = {...this.role};
    this.editedPermissions = this.role.permissions ? Object.keys(this.role.permissions).map(cid => ({
      cid,
      allow: this.role?.permissions[cid]
    })) : [];
  }

  save() {
    this.saving = true;
    this.editedRole.permissions = Object.fromEntries(this.editedPermissions.map(node => [node.cid, node.allow]));
    if (this.creating) post(`/api/roles/${this.editedRole.rid}`, {
      rid: this.editedRole.rid,
      name: this.editedRole.name,
      desc: this.editedRole.desc,
      defaultPerm: this.editedRole.defaultPerm,
      permissions: this.editedRole.permissions
    }).then(() => post(`/api/roles/${this.editedRole.rid}/users`, {
      action: this.usersPopup.action,
      emails: this.emailsWithRoles
    })).then(() => EventBus.$emit('needRoleUpdate', () => {
      this.$router.push({name: 'Role', params: {rid: this.editedRole.rid}});
      this.saving = false;
    })).catch(err => {
      this.saving = false;
      alert(err);
    }); else {
      post<{ role: Role }>(`/api/roles/${this.rid}/admin`, {
        name: this.editedRole.name,
        desc: this.editedRole.desc,
        defaultPerm: this.editedRole.defaultPerm,
        permissions: this.editedRole.permissions
      }).then(json => {
        this.editing = false;
        Data.setRole({rid: this.rid, role: json.role});
        Data.setCurrentRole(json.role);
        EventBus.$emit('needRoleUpdate');
      }).catch(err => {
        alert(err)
      }).finally(() => this.saving = false)
    }
  }

  cancel() {
    if (this.creating) this.$router.push({name: "Roles"});
    else this.editing = false;
  }

  deleteRole() {
    if (prompt('Delete role?', 'Role ID') === this.rid) {
      this.saving = true;
      del(`/api/roles/${this.rid}`).then(() => {
        EventBus.$emit('needRoleUpdate');
        this.$router.push({name: "Roles"});
      })
    }
  }

  get role(): Role {
    return Data.currentRole || {} as Role;
  }

  get creating() {
    return !this.rid;
  }
}
</script>
