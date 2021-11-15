import Vue from "vue";
import {canCreate, canEdit, computeAccess, hasPermission, isAdmin} from "@/mixins/permission";
import {humanFileSize, initials, isCollectionRoute} from "@/mixins/helpers";
import {INPUT_ID_RULES, INPUT_NAME_RULES} from "@/mixins/inputRules";

Vue.mixin({
    data: () => ({
        INPUT_ID_RULES, INPUT_NAME_RULES
    }),
    methods: {
        isAdmin,
        humanFileSize,
        canCreate,
        canEdit,
        hasPermission,
        computeAccess,
        isCollectionRoute,
        initials,
    }
});