import Vue from 'vue';
import Vuetify from 'vuetify/lib'
import Config from "@/store/config"

Vue.use(Vuetify);
try {
    Config.dark;
} catch (e) {
    localStorage.clear();
    location.reload();
}

export default new Vuetify({
    theme: {
        options: {customProperties: true},
        themes: {
            light: {
                appbar: '#009A90',
                primary: '#009A90',
                secondary: '#314159',
                accent: '#414288',
                error: '#D1345B',
                success: '#4CAF50',
                warning: '#FFC107',
                background: '#ffffff'
            },
            dark: {
                appbar: '#156b67',
                primary: '#009A90',
                secondary: '#eeeeee',
                accent: '#7A7DFF',
                error: '#D1345B',
                success: '#4CAF50',
                warning: '#FFC107',
                background: '#1E1E1E'
            },
        },
        dark: Config.dark
    },
});
