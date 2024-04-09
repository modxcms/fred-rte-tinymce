const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, options) => {
    const isProd = options.mode === 'production';

    return {
        mode: options.mode,
        devtool: isProd ? false : 'source-map',

        entry: [
            '@babel/polyfill',
            './_build/assets/sass/fred-rte-tinymce.scss',
            './_build/assets/js/index.js'
        ],

        output: {
            path: path.resolve(__dirname, './assets/components/fredrtetinymce/web'),
            library: 'FredRTETinyMCE',
            libraryTarget: 'umd',
            libraryExport: 'default',
            filename: 'fredrtetinymce.min.js',
            clean: true,
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
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        {
                            loader: "css-loader",
                            options: {
                                url: false,
                                sourceMap: true
                            }
                        },
                        {
                            loader: "postcss-loader"
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                implementation: require("sass")
                            }
                        }
                    ]
                }
            ]
        },

        resolve: {
            extensions: [ '.ts', '.js' ],
        },

        plugins: [
            new MiniCssExtractPlugin({
                filename: "fredrtetinymce.css"
            })
        ]
    };
};
