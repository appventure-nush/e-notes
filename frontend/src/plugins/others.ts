import Vue from "vue";

// @ts-ignore
import vue_moment from "vue-moment";
// @ts-ignore
import ImageUploader from 'vue-image-upload-resize'
// @ts-ignore
import VueUploadComponent from 'vue-upload-component'

Vue.use(ImageUploader);
Vue.use(vue_moment);
Vue.component('file-upload', VueUploadComponent);