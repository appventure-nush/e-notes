import {Store} from 'vuex'
import firebase from "firebase/compat";
import {User} from "@/types/user";
import {Collection} from "@/types/coll";
import {Note} from "@/types/note";
import {Role} from "@/types/role";
import {MarkdownItVueOptions} from "@/components/markdownViewer/markdown";

type RecursivePartial<T> = {
    [P in keyof T]?:
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
        T[P] extends object ? RecursivePartial<T[P]> :
            T[P];
};

export interface State {
    dark: boolean;
    user?: firebase.User;
    profile?: User;

    drawerOpen: boolean;
    collectionListOpen: boolean;

    currentCollection?: Collection;
    currentNotes?: Note[];
    currentRoles?: Role[];
    currentUser?: User;
    currentNote?: Note;
    currentRole?: Role;
    collections: Collection[];

    markdownOptions: RecursivePartial<MarkdownItVueOptions>;
}

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
        $store: Store<State>
    }
}
declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        store?: Store<State>;
    }
}

declare module "vue/types/vue" {
    interface Vue {
        $store: Store<State>;
    }
}