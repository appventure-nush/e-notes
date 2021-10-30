import {Store} from 'vuex'
import firebase from "firebase/compat";
import {User} from "@/types/user";

export interface State {
    user?: firebase.User,
    profile?: User
}

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
        $store: Store<State>
    }
}