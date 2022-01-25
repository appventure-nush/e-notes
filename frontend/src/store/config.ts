import {getModule, Module, Mutation, MutationAction, VuexModule} from 'vuex-module-decorators'
import {User} from "@/types/user";
import {FirebaseUser} from "@/types/shims/shims-firebase-user";
import {get, verifyToken} from "@/mixins/api";
import {auth} from "@/plugins/firebase";
import store from "@/store/index";
import {signOut} from "@firebase/auth";
import {Settings} from "@/types/settings";
import Vue from "vue";

@Module({
    dynamic: true, store,
    name: 'config',
    namespaced: true,
    preserveState: !!localStorage.getItem('vuex')
})
class ConfigModule extends VuexModule {
    settings: Settings = {};

    user: FirebaseUser | null = null;
    profile: User | null = null;

    quizAnswers: { [key: string]: number } = {};

    @Mutation
    setAnswer({key, ans}: { key: string, ans: number }) {
        if (!this.quizAnswers) this.quizAnswers = {};
        Vue.set(this.quizAnswers, key, ans);
    }

    @Mutation
    updateAnswers(ans: { [key: string]: number }) {
        this.quizAnswers = ans;
    }

    @Mutation
    setDark(dark: boolean) {
        Vue.set(this.settings, 'dark', dark);
    }

    @Mutation
    setDrawer(drawer: boolean) {
        Vue.set(this.settings, 'drawer', drawer);
    }

    @Mutation
    setMini(mini: boolean) {
        Vue.set(this.settings, 'mini', mini);
    }

    @Mutation
    setUser(user: FirebaseUser | null) {
        this.user = user;
    }

    @Mutation
    updateSettings(settings: Settings) {
        this.settings = {...settings};
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
        get("/api/auth/logout").then(() => {
            if (!no_redirect) window.location.href = "/login";
        }).catch(e => console.log(e));
        return {user: null, profile: null};
    }
}

const config = getModule(ConfigModule);
try {
    if (!config) {
        localStorage.clear();
        location.reload();
    }
    if (!config.settings) config.updateSettings({});
    if (!config.quizAnswers) config.updateAnswers({});
} catch (e) {
    localStorage.clear();
    location.reload();
}
export default config;