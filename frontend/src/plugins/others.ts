import Vue from "vue";

import vue_moment from "vue-moment";
import VueUploadComponent from 'vue-upload-component'
import VueLazyLoad from 'vue-lazyload'

Vue.use(VueLazyLoad)
Vue.use(vue_moment);
Vue.component('file-upload', VueUploadComponent);