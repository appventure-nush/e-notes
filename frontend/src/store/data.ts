import {Module, VuexModule, Action, MutationAction, Mutation, getModule} from 'vuex-module-decorators'
import {Role} from "@/types/role";
import {User} from "@/types/user";
import {Collection} from "@/types/coll";
import {get} from "@/mixins/api";
import {Note} from "@/types/note";
import store from "@/store/index";

import Vue from "vue";

export type Image = { url: string, name: string };

@Module({
    dynamic: true, store,
    name: 'data',
    namespaced: true,
    preserveState: localStorage.getItem('vuex') !== null
})
class DataModule extends VuexModule {
    // state
    roles: Role[] = []
    users: User[] = []
    collections: Collection[] = []

    notes: { [cid: string]: Note[] } = {};
    images: { [cid: string]: Image[] } = {};

    currentRole: Role | null = null;
    currentUser: User | null = null;
    currentCollection: Collection | null = null;
    currentNotes: Note[] | null = [];
    currentImages: Image[] | null = [];
    currentNote: Note | null = null;

    @Mutation
    setCurrentRole(currentRole: Role | null) {
        return this.currentRole = currentRole;
    }

    @Mutation
    setCurrentUser(currentUser: User | null) {
        return this.currentUser = currentUser;
    }

    @Mutation
    setCurrentCollection(currentCollection: Collection | null) {
        return this.currentCollection = currentCollection;
    }

    @Mutation
    setCurrentNotes(currentNotes: Note[] | null) {
        return this.currentNotes = currentNotes;
    }

    @Mutation
    setCurrentImages(currentImages: Image[] | null) {
        return this.currentImages = currentImages;
    }

    @Mutation
    setCurrentNote(currentNote: Note | null) {
        return this.currentNote = currentNote;
    }

    @Mutation
    setNotes({cid, notes}: { cid: string, notes: Note[] | null }) {
        if (notes) return Vue.set(this.notes, cid, notes);
        Vue.delete(this.notes, cid);
        return null;
    }

    @Mutation
    setImages({cid, images}: { cid: string, images: Image[] | null }) {
        if (images) return Vue.set(this.images, cid, images);
        Vue.delete(this.images, cid);
        return null;
    }

    @Mutation
    setCollection({cid, collection}: { cid: string, collection: Collection | null }): Collection | null {
        const i = this.collections.findIndex(c => c && c.cid === cid);
        if (i === -1) {
            if (collection) this.collections.push(collection);
        } else {
            if (!collection) this.collections.splice(i, 1);
            else this.collections[i] = collection;
        }
        return collection;
    }

    @Mutation
    setUser({uid, user}: { uid: string, user: User | null }): User | null {
        const i = this.users.findIndex(c => c && c.uid === uid);
        if (i === -1) {
            if (user) this.users.push(user);
        } else {
            if (!user) this.users.splice(i, 1);
            else this.users[i] = user;
        }
        return user;
    }

    @Mutation
    setRole({rid, role}: { rid: string, role: Role | null }): Role | null {
        const i = this.roles.findIndex(c => c && c.rid === rid);
        if (i === -1) {
            if (role) this.roles.push(role);
        } else {
            if (!role) this.roles.splice(i, 1);
            else this.roles[i] = role;
        }
        return role;
    }

    @MutationAction({mutate: ['roles']})
    async fetchRoles() {
        return {roles: await get('/api/roles')};
    }

    @MutationAction({mutate: ['users']})
    async fetchUsers() {
        return {users: await get('/api/users')};
    }

    @MutationAction({mutate: ['collections']})
    async fetchCollections() {
        return {collections: await get('/api/collections')};
    }

    @Action({rawError: true})
    async fetchNotes(cid: string) {
        this.setCurrentNotes(this.notes[cid]);
        const notes = await get<Note[]>(`/api/collections/${cid}/notes`);
        this.setCurrentNotes(notes);
        return this.setNotes({cid, notes});
    }

    @Action({rawError: true})
    async fetchImages(cid: string) {
        this.setCurrentImages(this.images[cid]);
        const images = await get<Image[]>(`/api/collections/${cid}/img`);
        this.setCurrentImages(images);
        return this.setImages({cid, images});
    }

    @Action({rawError: true})
    async fetchCollection(cid: string) {
        this.setCurrentCollection(this.collections.find(c => c && c.cid === cid) || null);
        const collection = await get<Collection>(`/api/collections/${cid}`);
        this.setCurrentCollection(collection);
        return this.setCollection({cid, collection});
    }

    @Action({rawError: true})
    async fetchUser(uid: string): Promise<User | null> {
        this.setCurrentUser(this.users.find(c => c && c.uid === uid) || null)
        const user = await get<User>(`/api/users/${uid}`);
        this.setCurrentUser(user);
        return this.setUser({uid, user});
    }

    @Action({rawError: true})
    async fetchRole(rid: string) {
        this.setCurrentRole(this.roles.find(c => c && c.rid === rid) || null)
        const role = await get<Role>(`/api/roles/${rid}`);
        this.setCurrentRole(role);
        return this.setRole({rid, role});
    }
}

export default getModule(DataModule);