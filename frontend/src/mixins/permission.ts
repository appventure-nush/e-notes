import {
    CREATE_COLLECTION,
    EDIT_OTHER_COLLECTION
} from "@/types/user";
import store from "@/store";
import {Collection} from "@/types/coll";

export function canCreate(): boolean {
    const user = store.state.profile;
    if (!user) return false;
    if (user.admin) return true;
    return ((user.access || 0) & CREATE_COLLECTION) === CREATE_COLLECTION;
}

export function canEdit(collection: Collection): boolean {
    if (!collection) return false;
    const user = store.state.profile;
    if (!user) return false;
    if (user.admin) return true;
    if (user.uid === collection.owner) return true;
    return ((user.access || 0) & EDIT_OTHER_COLLECTION) === EDIT_OTHER_COLLECTION;
}