<template>
  <v-data-table
      :headers="permissionHeaders"
      :items="this.editedPermissions"
      :no-data-text="noData"
      disable-pagination
      hide-default-footer>
    <template v-slot:item.allow="{ item }">
      <PermissionToggleButton
          v-if="editing"
          v-model="item.allow"
      ></PermissionToggleButton>
      <span v-else v-text="permToText(item.allow)"></span>
    </template>
    <template v-slot:item.actions="{ item }" v-if="editing">
      <v-icon small @click="deletePermissionDeclaration(item)">
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:footer v-if="editing">
      <v-row no-gutters class="flex-nowrap mx-2">
        <v-col class="flex-grow-1 mx-2">
          <v-autocomplete item-text="name" item-value="cid" :items="collections" hide-details v-model="toAddPerm.cid"
                          dense label="Collection"></v-autocomplete>
        </v-col>
        <v-col class="flex-grow-0">
          <PermissionToggleButton v-model="toAddPerm.allow"></PermissionToggleButton>
        </v-col>
        <v-col class="flex-grow-0 my-auto">
          <v-btn text @click="commitPermToAdd">Add</v-btn>
        </v-col>
      </v-row>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import {Component, Prop, Vue, ModelSync} from "vue-property-decorator";
import Data from "@/store/data";
import PermissionToggleButton from "@/components/PermissionToggleButton.vue";

@Component({
  components: {PermissionToggleButton}
})
export default class PermissionEditor extends Vue {
  @Prop({type: Boolean, default: false}) editing!: boolean;
  @Prop({type: String}) noData?: string;
  @ModelSync('change', 'edited', {type: Array}) editedPermissions!: { cid: string, allow: number | boolean }[];

  toAddPerm: { cid: string, allow: boolean } = {cid: '', allow: true};

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

  permToText(perm: boolean | number) {
    switch (perm) {
      case false:
      case 0b000:
        return "Deny"
      case true:
      case 0b001:
        return "View"
      case 0b011:
      case 0b010:
        return "Edit"
    }
  }

  get collections() {
    return Data.collections || [];
  }

  get permissionHeaders() {
    return [{text: 'Collection', align: 'start', value: 'cid'},
      {text: 'Permission', value: 'allow'},
      {text: 'Actions', value: 'actions', sortable: false, align: this.editing ? undefined : ' d-none'}]
  }
}
</script>