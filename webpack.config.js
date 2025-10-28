const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: [
        './src/Prototypes.ts',
        './src/OCharts.ts'
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'ocharts.js',
        cssFilename: 'ocharts.css',
        clean: true
    },
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules: [
            path.resolve(__dirname, 'src')
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                // https://terser.org/docs/options/
                terserOptions: {
                    ecma: 2015,
                    compress: {
                        passes: 2
                    }
                },
            })
        ]
    },
    plugins: [
        new MiniCssExtractPlugin()
    ]
}