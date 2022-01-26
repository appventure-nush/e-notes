// eslint-disable-next-line @typescript-eslint/no-var-requires
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');
const path = require("path");
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
            title: "Login",
            chunks: ['chunk-vendors', 'chunk-common', 'login']
        },
        email: {
            entry: 'src/pages/EmailLanding/main.ts',
            template: 'public/index.html',
            filename: 'email.html',
            title: "Landing Site",
            chunks: ['chunk-vendors', 'chunk-common', 'email']
        }
    },
    productionSourceMap: false,
    transpileDependencies: [
        'vuetify', 'vuex-persist', 'vuex-module-decorators'
    ],
    configureWebpack: {
        plugins: [
            new MomentLocalesPlugin({
                localesToKeep: ['en-gb'],
            })
        ]
    }
}
