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
          <v-card-title>
            <v-text-field v-if="editing" v-model="editedRole.name" hide-details label="Role Name"></v-text-field>
            <span v-text="role.name" v-else></span>
          </v-card-title>
          <v-card-subtitle>
            <v-text-field disabled v-if="editing" v-model="editedRole.rid" hide-details label="Role ID"></v-text-field>
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
            <div class="my-1">
              <UserAvatar :uid="uid" :size="46" classes="ma-1" :key="uid" v-for="uid in usersWithRole||[]"></UserAvatar>
              <v-btn v-if="editing"></v-btn>
            </div>
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
                  <v-autocomplete item-text="name" item-value="cid" :items="$store.state.collections" hide-details
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
import {Role} from "@/types/role";
import {get, post} from "@/mixins/api";
import UserAvatar from "@/components/UserAvatar.vue";
import {User} from "@/types/user";

@Component({
  components: {UserAvatar}
})
export default class RoleViewer extends Vue {
  @Prop(String) readonly rid!: string;
  @Prop(Array) readonly roles!: Role[];
  readonly name = "RoleViewer";
  loading = false;
  saving = false;
  editing = false;
  role: Role = {} as Role;
  editedRole: Role = {} as Role;
  usersWithRole: User[] = [];
  editedPermissions: { cid: string, allow: boolean }[] = []
  toAddPerm: { cid: string, allow: boolean } = {cid: '', allow: true};

  @Watch('rid', {immediate: true})
  onRIDChange() {
    this.editing = false;
    this.saving = false;
    let role = this.roles.find(r => r.rid === this.rid);
    if (!role) return this.$router.push({name: "Roles"});
    this.role = role;
    this.toAddPerm = {cid: '', allow: true};
    get(`/api/roles/${this.rid}/users`).then(res => res.json()).then(json => {
      if (!json.status) this.usersWithRole = json;
    });
  }

  @Watch('roles', {immediate: true, deep: true})
  onRolesChange() {
    this.onRIDChange();
  }

  @Watch('role')
  onRoleChange() {
    if (!this.role) return;
    document.title = this.role.name || this.rid || 'Roles';
    this.editedRole = {...this.role};
    this.editedPermissions = this.role.permissions ? Object.keys(this.role.permissions).map(cid => ({
      cid,
      allow: this.role.permissions[cid]
    })) : [];
  }

  save() {
    this.saving = true;
    this.editedRole.permissions = Object.fromEntries(this.editedPermissions.map(node => [node.cid, node.allow]));
    post(`/api/roles/${this.rid}/admin`, {
      name: this.editedRole.name,
      desc: this.editedRole.desc,
      defaultPerm: this.editedRole.defaultPerm,
      permissions: this.editedRole.permissions
    }).then(res => res.json()).then(json => {
      if (json.status !== 'success') throw json.reason;
      this.editing = false;
      this.role = json.role;
      this.$store.cache.delete('getRoles');
    }).catch(err => {
      alert(err)
    }).finally(() => this.saving = false)
  }

  deletePermissionDeclaration(item: { cid: string, allow: boolean }) {
    const i = this.editedPermissions.findIndex(p => p.cid === item.cid);
    if (i === -1) return;
    this.editedPermissions.splice(i, 1)
  }

  commitPermToAdd() {
    if (!this.toAddPerm.cid) return;
    this.editedPermissions.push(this.toAddPerm);
    this.toAddPerm = {cid: '', allow: true};
  }

  get permissionHeaders() {
    return [{text: 'Collection', align: 'start', value: 'cid'},
      {text: 'Permission', value: 'allow'},
      {text: 'Actions', value: 'actions', sortable: false, align: this.editing ? undefined : ' d-none'}]
  }
}
</script>