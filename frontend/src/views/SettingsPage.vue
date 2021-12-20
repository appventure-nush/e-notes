<template>
  <v-container>
    <v-row>
      <v-col cols="3" md="2">
        <v-list nav>
          <v-list-item-group v-model="selectedConfig">
            <v-list-item link v-for="(config,i) in CONFIG_SETTINGS" :key="i">
              <v-list-item-content>
                <v-list-item-title v-text="config.name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="auto">
        <v-checkbox
            v-for="child in CONFIG_SETTINGS[selectedConfig].children" :key="child.key"
            v-model="editedSettings[child.key]"
            :label="child.name" :hint="child.desc" persistent-hint
        ></v-checkbox>
      </v-col>
    </v-row>
    <v-snackbar :value="hasChanges">
      Unsaved changes

      <template v-slot:action="{ attrs }">
        <v-btn
            color="success"
            text
            v-bind="attrs"
            @click="save">
          Save
        </v-btn>
        <v-btn
            color="red"
            text
            v-bind="attrs"
            @click="cancel">
          Cancel
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import {Settings} from "@/types/settings";
import Config from "@/store/config";

function setting_equals(x: Settings, y: Settings) {
  if (x === y) return true;
  type Key = keyof Settings;
  let k!: Key;
  for (k in x) if (Boolean(x[k]) !== Boolean(y[k])) return false;
  for (k in y) if (Boolean(x[k]) !== Boolean(y[k])) return false;
  return true;
}

@Component
export default class SettingsPage extends Vue {
  name = "SettingsPage"

  editedSettings: Settings = {};
  selectedConfig = 0;

  @Watch('settings', {deep: true, immediate: true})
  onSettingsChange(val: Settings) {
    this.editedSettings = {...val};
  }

  save() {
    Config.updateSettings(this.editedSettings);
  }

  cancel() {
    this.editedSettings = {...this.settings};
  }

  get settings() {
    return Config.settings;
  }

  get hasChanges() {
    return !setting_equals(this.editedSettings, this.settings);
  }

  readonly CONFIG_SETTINGS = [{
    name: "General",
    children: [{
      key: "dark",
      name: "Dark Mode",
      desc: "Good for your eyes"
    }, {
      key: "permanentDrawer",
      name: "Permanent Drawer",
      desc: "Tired of opening and closing the drawer?"
    }, {
      key: "mini",
      name: "Mini Drawer",
      desc: "Cute and cozy"
    }, {
      key: "noTransition",
      name: "No Transitions",
      desc: "May break parts of the UI, and does not apply to everything"
    }]
  }, {
    name: "Display",
    children: [{
      key: "showPages",
      name: "Show Pages",
      desc: "No longer do you have to open the drawer to view other pages"
    }, {
      key: "noHTML",
      name: "Disable HTML (markdown)",
      desc: "No XSS if you can't put html on my page"
    }, {
      key: "noLinkify",
      name: "Disable Autolink (markdown)",
      desc: "URLs won't be automatically turned into links"
    }, {
      key: "lineBreaks",
      name: "Create linebreaks for \\n (markdown)",
      desc: "May affect markdown formatting"
    }]
  }]
}
</script>