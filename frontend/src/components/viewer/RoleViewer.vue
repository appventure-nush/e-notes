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
            <v-textarea v-if="editing" v-model="editedRole.desc" no-resize dense hide-details
                        label="Description"></v-textarea>
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
                <UserAvatar :uid="uid" :size="46" classes="ma-1" :key="uid" v-for="uid in usersWithRole||[]"
                            :elevation="hover?3:0"></UserAvatar>
              </div>
            </v-hover>
            <RoleUserPopup ref="users-popup" :rid="rid" :show="editing"></RoleUserPopup>
          </v-card-text>
          <v-data-table
              :headers="permissionHeaders"
              :items="this.editedPermissions"
              no-data-text="No overrides set for this role"
              disable-pagination
              hide-default-footer>
            <template v-slot:item.allow="{ item }">
              <v-simple-checkbox
                  v-if="editing"
                  :ripple="false"
                  v-model="item.allow"
              ></v-simple-checkbox>
              <span v-else v-text="item.allow?'Allow':'Deny'"></span>
            </template>
            <template v-slot:item.actions="{ item }" v-if="editing">
              <v-icon small @click="deletePermissionDeclaration(item)">
                mdi-delete
              </v-icon>
            </template>
            <template v-slot:footer v-if="editing">
              <v-row no-gutters class="flex-nowrap mx-2">
                <v-col class="flex-grow-1 mx-2">
                  <v-autocomplete item-text="name" item-value="cid" :items="collections" hide-details
                                  v-model="toAddPerm.cid" dense label="Collection"></v-autocomplete>
                </v-col>
                <v-col tag="v-simple-checkbox" class="flex-grow-0" v-model="toAddPerm.allow" dense
                       :ripple="false"></v-col>
                <v-col tag="v-btn" class="flex-grow-0 my-auto" text @click="commitPermToAdd">Add</v-col>
              </v-row>
            </template>
          </v-data-table>
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

@Component({
  components: {RoleUserPopup, UserAvatar}
})
export default class RoleViewer extends Vue {
  @Prop(String) readonly rid!: string;
  @Prop(Array) readonly roles!: Role[];

  @Ref('users-popup') readonly usersPopup!: RoleUserPopup;
  readonly name = "RoleViewer";
  loading = false;
  saving = false;
  editing = false;
  editedRole: Role = {} as Role;
  usersWithRole: string[] = [];
  editedPermissions: { cid: string, allow?: boolean }[] = []
  toAddPerm: { cid: string, allow: boolean } = {cid: '', allow: true};

  // for creation only
  emailsWithRoles: string[] = [];

  mounted() {
    this.usersPopup.$on('emails', (emails: string[]) => {
      if (!this.creating) {
        this.saving = true;
        post<{ updated: number, users: string[] }>(`/api/roles/${this.rid}/users`, {
          action: this.usersPopup.action,
          emails: emails
        }).then(json => {
          this.saving = false;
          console.log("Updated users count", json.updated);
          this.usersWithRole = json.users;
        });
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
    this.toAddPerm = {cid: '', allow: true};
    if (this.creating) {
      this.editing = true;
      this.editedRole = {} as Role;
      this.editedPermissions = [];
      return;
    }
    let role = this.roles.find(r => r.rid === this.rid);
    if (!role) return this.$router.push({name: "Roles"});
    Data.setCurrentRole(role);
    get<string[]>(`/api/roles/${this.rid}/users`).then(json => this.usersWithRole = json);
  }

  @Watch('roles', {immediate: true, deep: true})
  onRolesChange() {
    this.onRIDChange();
  }

  @Watch('role')
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

  deletePermissionDeclaration(item: { cid: string, allow: boolean }) {
    const i = this.editedPermissions.findIndex(p => p.cid === item.cid);
    if (i === -1) return;
    this.editedPermissions.splice(i, 1)
  }

  commitPermToAdd() {
    if (!this.toAddPerm.cid) return;
    let edit = this.editedPermissions.find(perm => perm.cid === this.toAddPerm.cid);
    if (edit) edit.allow = this.toAddPerm.allow;
    else this.editedPermissions.push(this.toAddPerm);
    this.toAddPerm = {cid: '', allow: true};
  }

  get role() {
    return Data.currentRole;
  }

  get collections() {
    return Data.collections;
  }

  get creating() {
    return !this.rid;
  }

  get permissionHeaders() {
    return [{text: 'Collection', align: 'start', value: 'cid'},
      {text: 'Permission', value: 'allow'},
      {text: 'Actions', value: 'actions', sortable: false, align: this.editing ? undefined : ' d-none'}]
  }
}
</script>