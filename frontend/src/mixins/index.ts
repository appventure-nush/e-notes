import Vue from "vue";
import {canCreate, canEdit} from "@/mixins/permission";
import {humanFileSize} from "@/mixins/helpers";

Vue.mixin({
    methods: {
        humanFileSize,
        canCreate,
        canEdit,
    }
});