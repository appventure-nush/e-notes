<template>
  <v-container>
    <div>
      <h1 class="text-h6">Server Config</h1>
      <v-card outlined>
        <v-card-text>
          <v-textarea style="font-family: monospace" label="Teacher Directory" no-resize persistent-hint
                      v-model="teacher_directory"
                      hint='https://espace2.nushigh.edu.sg/.do?action=chart&obj=Staff_Directory'>
            <template v-slot:append>
              <v-btn icon @click="submitDirectory">
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </template>
          </v-textarea>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import {Teachers} from "@/types/teachers";
import {get, post} from "@/mixins/api";

@Component
export default class Config extends Vue {
  name = "Config"
  teachers: Teachers = {directory: []};

  teacher_directory = "";

  created() {
    get<Teachers>("/api/admin").then(res => this.teachers = res)
  }

  @Watch('teachers', {deep: true})
  onDataUpdate() {
    this.teacher_directory = JSON.stringify(this.teachers.directory, null, '\t');
  }

  submitDirectory() {
    post<Teachers>("/api/admin/directory", JSON.parse(this.teacher_directory)).then(res => this.teachers = res)
  }
}
</script>