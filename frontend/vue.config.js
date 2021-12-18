module.exports = {
    pages: {
        index: {
            entry: 'src/pages/Index/main.ts',
            template: 'public/index.html',
            filename: 'index.html',
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        },
        login: {
            entry: 'src/pages/Login/main.ts',
            template: 'public/index.html',
            filename: 'login.html',
            chunks: ['chunk-vendors', 'chunk-common', 'login']
        }
    },
    productionSourceMap: false,
    transpileDependencies: [
        'vuetify', 'vuex-persist', 'vuex-module-decorators'
    ]
}
