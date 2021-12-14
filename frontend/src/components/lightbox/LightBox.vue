<template>
  <div @click.stop="closeLightBox">
    <transition
        mode="out-in"
        name="vue-lb-content-transition"
        @afterEnter="enableImageTransition"
        @beforeLeave="disableImageTransition">
      <div
          v-if="media"
          v-show="lightBoxOn"
          ref="container"
          class="vue-lb-container">
        <div class="vue-lb-content">
          <div class="vue-lb-header">
            <span/>
            <button
                v-if="closable"
                type="button"
                :title="closeText"
                class="vue-lb-button-close"
            >
              <slot name="close">
                <v-icon dark>
                  mdi-close
                </v-icon>
              </slot>
            </button> <!-- .vue-lb-button-close -->
          </div> <!-- .vue-lb-header -->
          <div
              class="vue-lb-figure"
              @click.stop>
            <transition
                mode="out-in"
                :name="modalImageTransitionName">
              <img
                  :key="media[select].src"
                  :src="media[select].src"
                  :srcset="media[select].srcset || ''"
                  class="vue-lb-modal-image"
                  :alt="media[select].caption">
            </transition>

            <slot name="customCaption">
              <div
                  v-show="showCaption"
                  class="vue-lb-info"
                  v-html="media[select].caption"/>
            </slot>

            <div class="vue-lb-footer">
              <div class="vue-lb-footer-info"/>
              <div
                  v-show="showFooterCount"
                  class="vue-lb-footer-count">
                <slot
                    name="footer"
                    :current="select + 1"
                    :total="media.length">
                  {{ select + 1 }} / {{ media.length }}
                </slot>
              </div>
            </div>
          </div>
        </div> <!-- .vue-lb-content -->
        <div class="vue-lb-thumbnail-wrapper">
          <div
              v-if="showThumbs"
              class="vue-lb-thumbnail">
            <button
                v-if="media.length > 1"
                type="button"
                class="vue-lb-thumbnail-arrow vue-lb-thumbnail-left"
                :title="previousThumbText"
                @click.stop="previousImage()">
              <slot name="previousThumb">
                <v-icon dark>
                  mdi-arrow-left
                </v-icon>
              </slot>
            </button>

            <div
                v-for="(image, index) in imagesThumb"
                v-show="index >= thumbIndex.begin && index <= thumbIndex.end"
                :key="typeof image.src === 'string' ? `${image.src}${index}` : index"
                v-bind:style="{ 'background-image': 'url(' + image + ')' }"
                :class="'vue-lb-modal-thumbnail' + (select === index ? '-active' : '')"
                @click.stop="showImage(index)">
            </div>

            <button
                v-if="media.length > 1"
                type="button"
                class="vue-lb-thumbnail-arrow vue-lb-thumbnail-right"
                :title="nextThumbText"
                @click.stop="nextImage()"
            >
              <slot name="nextThumb">
                <v-icon dark>
                  mdi-arrow-right
                </v-icon>
              </slot>
            </button>
          </div> <!-- .vue-lb-thumbnail -->
        </div>
        <button
            v-if="media.length > 1"
            type="button"
            class="vue-lb-arrow vue-lb-left"
            :title="previousText"
            @click.stop="previousImage()"
        >
          <slot name="previous">
            <v-icon dark>
              mdi-arrow-left
            </v-icon>
          </slot>
        </button>

        <button
            v-if="media.length > 1"
            type="button"
            class="vue-lb-arrow vue-lb-right"
            :title="nextText"
            @click.stop="nextImage()"
        >
          <slot name="next">
            <v-icon dark>
              mdi-arrow-right
            </v-icon>
          </slot>
        </button>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import Hammer from "hammerjs";

export type MediaType = {
  src: string,
  thumb: string,
  type: string,
  caption: string
}

@Component
export default class LightBox extends Vue {
  @Ref('container') readonly container!: HTMLElement;

  @Prop({type: Array, required: true}) readonly media!: MediaType[];
  @Prop({type: Boolean, default: true}) readonly disableScroll!: boolean;
  @Prop({type: Boolean, default: true}) readonly disableZoom!: boolean;
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
  modalImageTransitionName = 'vue-lb-modal-image-no-transition'

  get thumbIndex() {
    const halfDown = Math.floor(this.nThumbs / 2)

    if (this.select >= halfDown && this.select < this.media.length - halfDown) return {
      begin: this.select - halfDown + (1 - (this.nThumbs % 2)),
      end: this.select + halfDown
    }
    if (this.select < halfDown) return {
      begin: 0,
      end: this.nThumbs - 1
    }
    return {
      begin: this.media.length - this.nThumbs,
      end: this.media.length - 1
    }
  }


  get imagesThumb() {
    if (this.siteLoading) {
      return this.media.map(({thumb, type}) => ({
        src: thumb,
        type,
        loading: this.siteLoading,
        error: this.siteLoading,
      }))
    }
    return this.media.map(({thumb, type}) => ({
      src: thumb,
      type,
    }))
  }

  @Watch('lightBoxOn')
  onLightBoxOnChange(value: boolean) {
    this.onToggleLightBox(value)
  }

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

    this.onToggleLightBox(this.lightBoxOn)

    if (this.container) {
      const options: any = {}
      if (!this.disableZoom) options.touchAction = 'pan-x, pan-y'
      const hammer = new Hammer(this.container, options)
      hammer.on('swiperight', () => this.previousImage())
      hammer.on('swipeleft', () => this.nextImage())
    }
  }

  beforeDestroy() {
    document.removeEventListener('keydown', this.addKeyEvent)
    if (this.autoPlay) clearInterval(this.timer)
  }

  onLightBoxOpen() {
    this.$emit('onOpened')
    if (this.disableScroll) document.querySelector('html')?.classList.add('no-scroll')
    document.querySelector('body')?.classList.add('vue-lb-open')
    document.addEventListener('keydown', this.addKeyEvent)
  }

  onLightBoxClose() {
    this.$emit('onClosed')
    if (this.disableScroll) document.querySelector('html')?.classList.remove('no-scroll')
    document.querySelector('body')?.classList.remove('vue-lb-open')
    document.removeEventListener('keydown', this.addKeyEvent)
  }

  onToggleLightBox(value: boolean) {
    if (value) this.onLightBoxOpen()
    else this.onLightBoxClose()
  }

  showImage(index: number) {
    this.$set(this, 'select', index)
    this.$set(this, 'lightBoxOn', true)
  }

  addKeyEvent(event: KeyboardEvent) {
    if (event.keyCode === 37) this.previousImage() // left arrow
    if (event.keyCode === 39) this.nextImage() // right arrow
    if (event.keyCode === 27) this.closeLightBox() // esc
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

  enableImageTransition() {
    this.$set(this, 'modalImageTransitionName', 'vue-lb-modal-image-transition')
  }

  disableImageTransition() {
    this.$set(this, 'modalImageTransitionName', 'vue-lb-modal-image-no-transition')
  }
}
</script>

<style src="./style.css"></style>
