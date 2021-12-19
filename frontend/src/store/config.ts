import {Module, Mutation, MutationAction, VuexModule, getModule} from 'vuex-module-decorators'
import {User} from "@/types/user";
import {FirebaseUser} from "@/types/shims/shims-firebase-user";
import {get, verifyToken} from "@/mixins/api";
import {auth} from "@/plugins/firebase";
import store from "@/store/index";
import {signOut} from "@firebase/auth";

@Module({
    dynamic: true, store,
    name: 'config',
    namespaced: true,
    preserveState: localStorage.getItem('vuex') !== null
})
class ConfigModule extends VuexModule {
    dark = false;
    drawer = true;
    mini = false;

    showPages = false;

    user: FirebaseUser | null = null;
    profile: User | null = null;

    @Mutation
    setDark(dark: boolean) {
        this.dark = dark;
    }

    @Mutation
    setDrawer(drawer: boolean) {
        this.drawer = drawer;
    }

    @Mutation
    setMini(mini: boolean) {
        this.mini = mini;
    }

    @Mutation
    setUser(user: FirebaseUser | null) {
        this.user = user;
    }

    @MutationAction({mutate: ['profile']})
    async fetchProfile(reattempt = true): Promise<{ profile: User | null }> {
        let profile: User | null = null;
        try {
            profile = await get<User>("/api/auth");
        } catch (e) {
            try {
                if (auth.currentUser && reattempt) {
                    console.log("Re-login");
                    profile = await verifyToken(await auth.currentUser.getIdToken(true))
                }
            } catch (e) {
                console.log("Re-login failed", e);
                profile = null;
            }
        }
        return {profile};
    }

    @MutationAction({mutate: ['user', 'profile']})
    async logout(no_redirect = false) {
        if (auth.currentUser) await signOut(auth);
        if (localStorage) localStorage.clear();
        get("/api/auth/logout").then(() => {
            if (!no_redirect) window.location.href = "/login";
        }).catch(e => console.log(e));
        return {user: null, profile: null};
    }
}

export default getModule(ConfigModule);