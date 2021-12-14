<template>
  <v-row class="ma-2">
    <v-col cols="6" sm="4" md="3" lg="2"
           :key="image.name" class="pa-2"
           v-for="(image,index) in images">
      <v-card elevation="0" outlined :loading="deleting.includes(image.name)" @click="show(index)">
        <template slot="progress">
          <v-progress-linear
              indeterminate
              height="2"
          ></v-progress-linear>
        </template>
        <v-img :src="image.url" aspect-ratio="1"
               class="white--text align-end">
          <v-list-item-content class="pb-0" style="background:rgba(0,0,0,0.4)">
            <v-card-text class="py-0">{{ image.name }}</v-card-text>
            <v-btn v-if="canEdit(currentCollection)"
                   color="red" text @click.stop="$emit('delete',image.name)"
                   :disabled="deleting.includes(image.name)">
              Delete
            </v-btn>
          </v-list-item-content>
        </v-img>
      </v-card>
    </v-col>
    <LightBox
        v-if="media.length > 0"
        :media="media"
        :showThumbs="false"
        :show-caption="true"
        :show-light-box="false"
        ref="lightBox"></LightBox>
  </v-row>
</template>

<script lang="ts">
import {Component, Model, Prop, Ref, Vue} from "vue-property-decorator";
import LightBox from "@/components/lightbox/LightBox.vue";
import Data from "@/store/data"

@Component({components: {LightBox}})
export default class Gallery extends Vue {
  @Model('change', {type: Array}) readonly images!: { name: string, url: string }[];
  @Prop(Array) readonly deleting!: string[];
  @Ref('lightBox') readonly lightBox!: LightBox;

  show(i: number) {
    this.lightBox.showImage(i);
  }

  get media() {
    return this.images.map(i => ({
      caption: i.name,
      src: i.url,
      type: {}
    }));
  }

  get currentCollection() {
    return Data.currentCollection;
  }
}
</script>

<style scoped>

</style>