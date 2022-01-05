<template>
  <v-dialog
      content-class="vue-lb-container"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      transition="fade-transition"
      :overlay-opacity="0.7"
      v-model="lightBoxOn"
      max-width="977px"
      v-touch="{left: () => previousImage(),right: () => nextImage()}">
    <v-img
        contain
        class="vue-lb-modal-image"
        :key="media[select].src"
        :src="media[select].src"
        :alt="media[select].caption">
    </v-img>
    <span v-show="showCaption"
          class="vue-lb-info"
          v-html="media[select].caption"/>
    <v-btn
        icon
        v-if="media.length > 1"
        class="vue-lb-arrow vue-lb-left"
        :title="previousText"
        @click.stop="previousImage()">
      <v-icon dark>
        mdi-arrow-left
      </v-icon>
    </v-btn>
    <v-btn
        icon
        v-if="media.length > 1"
        class="vue-lb-arrow vue-lb-right"
        :title="nextText"
        @click.stop="nextImage()">
      <v-icon dark>
        mdi-arrow-right
      </v-icon>
    </v-btn>
    <v-btn
        icon
        v-if="closable"
        @click="closeLightBox"
        type="button"
        :title="closeText"
        class="vue-lb-button-close">
      <v-icon dark>
        mdi-close
      </v-icon>
    </v-btn>
    <v-btn
        icon
        type="button"
        :href="media[select].src"
        download
        class="vue-lb-button-download">
      <v-icon dark>
        mdi-download
      </v-icon>
    </v-btn>
    <div
        v-show="showFooterCount"
        class="vue-lb-footer">
      <slot
          name="footer"
          :current="select + 1"
          :total="media.length">
        {{ select + 1 }} / {{ media.length }}
      </slot>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

export type MediaType = {
  src: string,
  thumb: string,
  type: string,
  caption: string
}

@Component
export default class LightBox extends Vue {
  @Prop({type: Array, required: true}) readonly media!: MediaType[];
  @Prop({type: Boolean, default: true}) readonly showLightBox!: boolean;
  @Prop({type: Boolean, default: true}) readonly closable!: boolean;

  @Prop({type: Number, default: 0}) readonly startAt!: number;
  @Prop({type: Number, default: 7}) readonly nThumbs!: number;

  @Prop({type: Boolean, default: true}) readonly showThumbs!: boolean;
  @Prop({type: Boolean, default: true}) readonly showFooterCount!: boolean;
  @Prop({type: Boolean, default: false}) readonly showCaption!: boolean;
  @Prop({type: Boolean, default: false}) readonly autoPlay!: boolean;

  @Prop({type: Number, default: 3000}) readonly autoPlayTime!: number;
  @Prop({type: Number, default: 0}) readonly lengthToLoadMore!: number;
  @Prop({type: String, default: ''}) readonly siteLoading!: string;
  @Prop({type: String, default: 'Close (Esc)'}) readonly closeText!: string;
  @Prop({type: String, default: 'Previous'}) readonly previousText!: string;
  @Prop({type: String, default: 'Next'}) readonly nextText!: string;

  @Prop({type: String, default: 'Previous'}) readonly previousThumbText!: string;
  @Prop({type: String, default: 'Next'}) readonly nextThumbText!: string;

  select = this.startAt
  lightBoxOn = this.showLightBox
  timer = 0

  @Watch('select')
  onSelectChange() {
    this.$emit('onImageChanged', this.select)
    if (this.select >= this.media.length - this.lengthToLoadMore - 1) this.$emit('onLoad')
    if (this.select === this.media.length - 1) this.$emit('onLastIndex')
    if (this.select === 0) this.$emit('onFirstIndex')
    if (this.select === this.startAt) this.$emit('onStartIndex')
  }


  mounted() {
    if (this.autoPlay) {
      this.timer = window.setInterval(() => {
        this.nextImage()
      }, this.autoPlayTime)
    }
    document.addEventListener('keydown', this.addKeyEvent)
  }

  beforeDestroy() {
    document.removeEventListener('keydown', this.addKeyEvent)
    if (this.autoPlay) clearInterval(this.timer)
  }

  showImage(index: number) {
    this.$set(this, 'select', index)
    this.$set(this, 'lightBoxOn', true)
  }

  addKeyEvent(event: KeyboardEvent) {
    if (event.code === "ArrowLeft") this.previousImage() // left arrow
    if (event.code === "ArrowRight") this.nextImage() // right arrow
    if (event.code === "Escape") this.closeLightBox() // esc
  }

  closeLightBox() {
    if (!this.closable) return
    this.$set(this, 'lightBoxOn', false)
  }

  nextImage() {
    this.$set(this, 'select', (this.select + 1) % this.media.length)
  }

  previousImage() {
    this.$set(this, 'select', (this.select + this.media.length - 1) % this.media.length)
  }
}
</script>
<style>
.vue-lb-container.v-dialog--fullscreen {
  top: unset;
  height: unset;
}

.vue-lb-arrow {
  backdrop-filter: brightness(50%) blur(5px);
  position: fixed !important;;
  top: 50%;
  bottom: 50%;
}

.vue-lb-left {
  left: 2em;
}

.vue-lb-right {
  right: 2em;
}

.vue-lb-button-close {
  position: fixed !important;;
  top: 2em;
  right: 2em;
}

.vue-lb-button-download {
  position: fixed !important;;
  top: 2em;
  right: calc(2em + 36px + 1em);
}

.vue-lb-modal-image {
}

.vue-lb-info {
  left: 0;
  right: 0;
  position: fixed;
  top: 0;
  padding: 0.3em 0;
  width: 100%;
  text-align: center;
  backdrop-filter: blur(2px);
}

.vue-lb-footer {
  left: 0;
  right: 0;
  position: fixed;
  bottom: 0;
  padding: 0.3em 0;
  width: 100%;
  text-align: center;
  backdrop-filter: blur(2px);
}
</style>