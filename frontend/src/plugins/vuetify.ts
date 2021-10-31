import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import store from '@/store'

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#009a90',
            },
            dark: {
                primary: '#009a90',
            },
        },
        dark: store.state.dark
    },
});
