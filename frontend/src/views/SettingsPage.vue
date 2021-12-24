<template>
  <v-container>
    <v-row>
      <v-col cols="auto">
        <v-list nav>
          <v-list-item-group v-model="selectedConfig" mandatory>
            <v-list-item link v-for="(config,i) in CONFIG_SETTINGS" :key="i">
              <v-list-item-content>
                <v-list-item-title v-text="config.name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col>
        <template v-for="child in CONFIG_SETTINGS[selectedConfig].children">
          <v-slider v-model="editedSettings[child.key]" :key="child.key" class="mt-2" thumb-label
                    :label="child.name" :hint="child.desc" persistent-hint v-if="child.type==='slider'"
                    v-show="!child.showIf||child.showIf()"
                    :disabled="child.disabledBy&&editedSettings[child.disabledBy]"
          ></v-slider>
          <v-checkbox v-model="editedSettings[child.key]" :key="child.key"
                      :label="child.name" :hint="child.desc" persistent-hint v-else
                      v-show="!child.showIf||child.showIf()"
                      :disabled="child.disabledBy&&editedSettings[child.disabledBy]"
          ></v-checkbox>
        </template>
        <template v-if="CONFIG_SETTINGS[selectedConfig].actions">
          <v-divider class="my-3"></v-divider>
          <v-list-item v-for="action in CONFIG_SETTINGS[selectedConfig].actions" :key="action.name">
            <v-list-item-action>
              <v-btn @click="action.action" :color="action.color" v-text="action.name" outlined></v-btn>
            </v-list-item-action>
            <v-list-item-content class="text--secondary" v-text="action.desc"></v-list-item-content>
          </v-list-item>
        </template>
      </v-col>
    </v-row>
    <v-snackbar :timeout="-1" :value="hasChanges">
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
import {humanFileSize} from "@/mixins/helpers";
import {EventBus} from "@/event";

function setting_equals(x: Settings, y: Settings) {
  if (x === y) return true;
  let k!: keyof Settings;
  for (k in x) {
    if (x[k] !== y[k]) return false;
  }
  for (k in y) {
    if (x[k] !== y[k]) return false;
  }
  return true;
}

type SettingConfig = {
  key: keyof Settings,
  disabledBy?: keyof Settings,
  showIf?: () => boolean,
  name: string,
  desc?: string,
  type?: 'slider' | 'textfield',
  default?: any
}

type ActionConfig = {
  name: string,
  desc?: string,
  color?: string,
  action: () => void
}

@Component
export default class SettingsPage extends Vue {
  name = "SettingsPage"

  editedSettings: Settings = {};
  selectedConfig = 0;

  @Watch('settings', {deep: true, immediate: true})
  onSettingsChange() {
    this.editedSettings = {...this.settings};

    for (const parent of this.CONFIG_SETTINGS) {
      for (const child of parent.children) {
        const key: keyof Settings = child.key as keyof Settings;
        if (child.default && !this.editedSettings[key]) {
          this.editedSettings[key] = child.default;
          Config.updateSettings(this.editedSettings);
          return;
        }
      }
    }
  }

  save() {
    Config.updateSettings(this.editedSettings);
  }

  cancel() {
    this.onSettingsChange();
  }

  get settings() {
    return Config.settings;
  }

  get hasChanges() {
    return !setting_equals(this.editedSettings, this.settings);
  }

  readonly CONFIG_SETTINGS: {
    name: string, children: SettingConfig[], actions?: ActionConfig[]
  }[] = [{
    name: "General",
    children: [{
      key: "dark",
      name: "Dark Mode",
      disabledBy: "autoDark",
      desc: "Good for your eyes"
    }, {
      key: "autoDark",
      name: "Auto Dark Mode",
      desc: "Fits your device's settings, will update in realtime"
    }, {
      key: "noTransition",
      name: "No Transitions",
      desc: "May break parts of the UI, and does not apply to everything"
    }, {
      key: "fontSize",
      name: "Font size",
      type: "slider",
      default: 16,
      desc: "Does not fix much of the spacing"
    }],
    actions: [{
      name: "Reset Config",
      desc: "Reset your config",
      color: "warning",
      action: () => {
        Config.updateSettings({});
      }
    }, {
      name: "Reset All",
      desc: "Reset local data, including config (localStorage)\nCurrent size: " + humanFileSize((localStorage?.getItem('vuex')?.length || 0) * 2),
      color: "error",
      action: () => {
        localStorage.removeItem('vuex');
        location.reload();
      }
    }]
  }, {
    name: "Layout",
    children: [{
      key: "showPages",
      name: "Show Pagination Buttons",
      desc: "No longer do you have to open the drawer to navigate the pages"
    }, {
      key: "permanentDrawer",
      name: "Permanent Drawer",
      desc: "Tired of opening and closing the drawer?"
    }, {
      key: "mini",
      name: "Mini Drawer",
      desc: "Cute and cozy"
    }, {
      key: "listDisplay",
      name: "Use lists for display",
      desc: "Compact, may not work everywhere (require manual coding)"
    }]
  }, {
    name: "Markdown",
    children: [{
      key: "permanentUwufy",
      name: "Permanent UwUfication",
      desc: "You actually liked the uwu text? *blushes",
      showIf: () => EventBus.uwufy || 'uwu' in this.$route.query
    }, {
      key: "noHTML",
      name: "Disable HTML",
      desc: "No XSS if you can't put html on my page"
    }, {
      key: "noSanitize",
      name: "Skip HTML Sanitization",
      desc: "Did something break? This will disable sanitization for markdown notes. Sanitization is turned on only for markdown!"
    }, {
      key: "noLinkify",
      name: "Disable Autolink",
      desc: "URLs won't be automatically turned into links"
    }, {
      key: "lineBreaks",
      name: "Create linebreaks for \\n",
      desc: "May affect markdown formatting"
    }, {
      key: "animationCss",
      name: "Allow animations with animate.css",
      desc: "Who knows maybe there would be a animated note in the future, note that the style will not be loaded if this option is disabled, and a reload is needed for this to take effect"
    }, {
      key: "forceImageDark",
      name: "Enforced dark mode for images",
      desc: "Those images are in light theme? Forcefully display them in dark mode, may break certain images"
    }]
  }]
}
</script>