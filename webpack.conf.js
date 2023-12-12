const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const buildFrontend = (_, env) => {
    const isProd = env.mode.startsWith('prod');
    const isDev = !isProd;

    return {
        target: 'web',
        mode: isDev ? 'development' : 'production',
        entry: {
            app: './src/Resources/scripts/react/index.tsx',
            vendor: './src/Resources/scripts/vendor.js'
        },
        output: {
            path: path.resolve(__dirname, 'public/assets'),
            filename: 'js/[name].js'
        },
        module: {
            rules: [
                {
                    test: /\.t|jsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: isDev
                            }
                        }
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.s?css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext]'
                    }
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "css/[name].css"
            }),
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    //keep_classnames: true,
                    //keep_fnames: true,
                    compress: isProd,
                    format: {
                        comments: false,
                    },
                }
            })
        ],
        optimization: {
            minimize: isProd,
            usedExports: !isProd,
            minimizer: [
                isProd ? new CssMinimizerPlugin({
                    minimizerOptions: {
                        preset: [
                            "default",
                            {
                                discardComments: { removeAll: true },
                            },
                        ],
                    },
                }) : () => {}
            ]
        },
        externals: {
            React: 'react',
            ReactDOM: 'react-dom',
            ReactRouterDOM: 'react-router-dom',
            bootstrap: 'bootstrap',
            jQuery: 'jquery'
        }
    }
}

module.exports = [
    buildFrontend
]