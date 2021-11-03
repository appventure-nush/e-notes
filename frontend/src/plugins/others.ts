import Vue from "vue";

import vue_moment from "vue-moment";
// @ts-ignore
import ImageUploader from 'vue-image-upload-resize'
import VueUploadComponent from 'vue-upload-component'
import VueLazyLoad from 'vue-lazyload'

Vue.use(VueLazyLoad)
Vue.use(ImageUploader);
Vue.use(vue_moment);
Vue.component('file-upload', VueUploadComponent);