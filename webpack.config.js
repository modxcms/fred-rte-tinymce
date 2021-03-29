const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, options) => {
    const isProd = options.mode === 'production';

    return {
        mode: options.mode,
        devtool: isProd ? false : 'source-map',

        entry: [
            '@babel/polyfill',
            './_build/assets/js/index.js'
        ],

        output: {
            path: path.resolve(__dirname, './assets/components/fredrtetinymce/web'),
            library: 'FredRTETinyMCE',
            libraryTarget: 'umd',
            libraryExport: 'default',
            filename: 'fredrtetinymce.min.js'
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader'
                    }
                }
            ]
        },

        resolve: {
            extensions: [ '.ts', '.js' ],
        },

        plugins: [
            isProd ? new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ['fredrtetinymce.*']
            }) : () => {}
        ]
    };
};