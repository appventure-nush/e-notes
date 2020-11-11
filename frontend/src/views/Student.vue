<template>
  <v-container fluid>
    <v-treeview
      id="tree-view"
      v-model="selection"
      :items="items"
      activatable
      open-on-click
      hoverable
      v-scroll
      @update:active="test"
    >
    </v-treeview>
  </v-container>
</template>
<style>
#tree-view {
  width: 15%;
}
</style>


<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Main",
  components: {
  },
  data: () => ({
    showMGSelect: false,
    selection: [],
    items: [
      {
        id: 1,
        name: 'Profile',
      },
      {
        id: 2,
        name: 'Roles',
      },
      {
        id: 3,
        name: 'Notes',
        children: [
          {
            id: 4,
            name: 'Test'
          }
        ]
      }
    ]
  }),
  methods: {
    test(selection: any) {
      this.showMGSelect = !this.showMGSelect
    }
  }
});
</script>
