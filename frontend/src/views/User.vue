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
              <v-text-field label="Name" v-if="editing" v-model="editedUser.name" hide-details outlined flat>
              </v-text-field>
              <span v-else v-text="user.name"></span>
            </h3>
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
            <div class="error--text align-center" v-if="user.admin||editing">
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
                          v-for="r in user.roles.filter(r=>!allRoles.includes(r))" v-text="r"/>
                </v-chip-group>
                <v-text-field class="mt-2" hide-details dense label="Custom Role" @keydown.enter="addRole"
                              v-model="roleToAdd"/>
              </template>
              <v-chip v-else :key="r" label small class="mr-2 mt-1" v-for="r in user.roles" v-text="r"/>
            </v-col>
            <v-col cols="12" sm="9" md="7" lg="6" v-else><i>None</i></v-col>
            <v-col cols="12">
              <v-data-table
                  :headers="permissionHeaders"
                  :items="this.editedPermissions"
                  no-data-text="No overrides set for this user"
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
                  <v-row no-gutters class="flex-nowrap">
                    <v-col cols="1" tag="v-text-field" class="flex-grow-1 mx-2" dense label="Collection"
                           v-model="toAddPerm.cid"></v-col>
                    <v-col tag="v-simple-checkbox" class="flex-grow-0" v-model="toAddPerm.allow" dense
                           :ripple="false"></v-col>
                    <v-col tag="v-btn" class="flex-grow-0 my-auto" text @click="commitPermToAdd">Add</v-col>
                  </v-row>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
          <v-card-actions v-if="isAdmin()">
            <v-spacer/>
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
import {Role} from "@/types/role";
import {computeAccess, hasPermission, splitAccess} from "@/mixins/permission";
import {post} from "@/mixins/api";
import {cached} from "@/store";

@Component
export default class UserView extends Vue {
  @Prop(String) readonly uid?: string;
  readonly name = "UserView";
  loading = false;
  saving = false;
  editing = false;
  user: User = {} as User;
  editedUser: User = {} as User;
  editedAccess: number[] = []
  editedPermissions: { cid: string, allow: boolean }[] = []
  toAddPerm: { cid: string, allow: boolean } = {cid: '', allow: true};

  allRoles: string[] = [];

  roleToAdd = "";

  readonly permissions = permissions;

  mounted() {
    this.onUIDChange();
    cached('getRoles').then((roles: Role[]) => this.allRoles = roles.map(r => r.rid));
  }

  @Watch('uid')
  onUIDChange() {
    this.loading = true;
    this.editing = false;
    this.saving = false;
    cached('getUser', this.uid).then((user: User) => {
      this.user = user;
      this.loading = false;
    });
    this.toAddPerm = {cid: '', allow: true};
  }

  @Watch('user')
  onUserChange() {
    if (!this.user) return;
    document.title = this.user.name || this.uid || 'Users';
    this.editedUser = {...this.user};
    this.editedAccess = splitAccess(this.user.access || 0);
    this.editedPermissions = this.user.permissions ? Object.keys(this.user.permissions).map(cid => ({
      cid,
      allow: this.user.permissions[cid]
    })) : [];
  }

  get perms() {
    return Object.entries(permissions).filter(([, p]) => hasPermission(computeAccess(this.user), p));
  }

  get permOverwrites() {
    return Object.entries(permissions).filter(([, p]) => hasPermission(this.user.access || 0, p));
  }

  save() {
    this.saving = true;
    this.editedUser.access = this.editedAccess.reduce((a, b) => a | b, 0);
    this.editedUser.permissions = Object.fromEntries(this.editedPermissions.map(node => [node.cid, node.allow]));
    post(`/api/users/${this.uid}`, {
      name: this.editedUser.name,
      nick: this.editedUser.nickname,
      roles: this.editedUser.roles,
      admin: this.editedUser.admin,
      access: this.editedUser.access,
      teacher: this.editedUser.teacher,
      permissions: this.editedUser.permissions
    }).then(res => res.json()).then(json => {
      if (json.status !== 'success') throw json.reason;
      this.editing = false;
      this.user = json.user;
      this.$store.cache.delete('getUser', this.uid);
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

  addRole() {
    if (!this.roleToAdd) return;
    if (this.allRoles.includes(this.roleToAdd)) return;
    this.allRoles.push(this.roleToAdd);
    this.editedUser.roles.push(this.roleToAdd);
    this.roleToAdd = "";
  }

  readonly teacherItems = [{text: "Teacher", value: true}, {text: "Student", value: false}]

  get permissionHeaders() {
    return [{text: 'Collection', align: 'start', value: 'cid'},
      {text: 'Permission', value: 'allow'},
      {text: 'Actions', value: 'actions', sortable: false, align: this.editing ? undefined : ' d-none'}]
  }
}
</script>