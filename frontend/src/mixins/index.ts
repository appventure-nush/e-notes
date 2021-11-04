import Vue from "vue";
import {canCreate, canEdit} from "@/mixins/permission";
import {humanFileSize} from "@/mixins/helpers";
import {INPUT_ID_RULES, INPUT_NAME_RULES} from "@/mixins/inputRules";

Vue.mixin({
    data: () => ({
        INPUT_ID_RULES, INPUT_NAME_RULES
    }),
    methods: {
        humanFileSize,
        canCreate,
        canEdit,
    }
});