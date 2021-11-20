declare module 'vuetify/lib/framework' {
    import Vuetify from 'vuetify'
    export default Vuetify
}

export interface VForm extends HTMLFormElement {
    validate(force?: boolean, value?: any): boolean
}