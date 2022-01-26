import Vue from "vue";
import moment from "moment";
import 'moment/locale/en-gb.js';
import {canCreate, canEdit, computeAccess, hasPermission, isAdmin} from "@/mixins/permission";
import {
    b64ToUrl,
    getHashCode,
    humanFileSize,
    initials,
    isCollectionRoute,
    normaliseJupyterOutput
} from "@/mixins/helpers";
import {INPUT_ID_RULES, INPUT_NAME_RULES} from "@/mixins/inputRules";

Vue.mixin({
    data: () => ({
        INPUT_ID_RULES, INPUT_NAME_RULES, moment
    }),
    methods: {
        isAdmin,
        humanFileSize,
        canCreate,
        canEdit,
        b64ToUrl,
        normaliseJupyterOutput,
        getHashCode,
        hasPermission,
        computeAccess,
        isCollectionRoute,
        initials
    },
    filters: {
        moment
    }
});