import {Module, Mutation, Action, MutationAction, VuexModule, getModule} from 'vuex-module-decorators'
import {User} from "@/types/user";
import {FirebaseUser} from "@/types/shims/shims-firebase-user";
import {get, post} from "@/mixins/api";
import {auth} from "@/plugins/firebase";
import router from "@/router";
import store from "@/store/index";

@Module({
    dynamic: true, store,
    name: 'config',
    namespaced: true,
    preserveState: localStorage.getItem('vuex') !== null
})
class ConfigModule extends VuexModule {
    dark = false;
    drawer = true;

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
    setUser(user: FirebaseUser | null) {
        this.user = user;
    }

    @Action
    verifyToken(token: string) {
        return post("/api/auth", {token: token});
    }

    @MutationAction({mutate: ['profile']})
    async fetchProfile(reattempt = true): Promise<{ profile: User | null }> {
        let profile: User | null = null;
        try {
            profile = await get<User>("/api/auth");
        } catch (e) {
            if (auth.currentUser && reattempt) profile = await this.verifyToken(await auth.currentUser.getIdToken(true))
                .then(() => this.fetchProfile(false)).then(p => p.profile)
                .catch(e => {
                    router.push({name: "Login"});
                    console.error(e);
                    return null;
                });
            else router.push({name: "Login"});
        }
        if (profile && router.currentRoute.name === 'Login') router.push('/');
        return {profile};
    }

    @MutationAction({mutate: ['user', 'profile']})
    async logout() {
        await auth.signOut();
        await get("/api/auth/logout");
        if (router.currentRoute.path !== '/login') router.push('/login');
        return {user: null, profile: null};
    }
}

export default getModule(ConfigModule);