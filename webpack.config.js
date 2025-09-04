const path = require('path')
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: './src/OCharts.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'ocharts.js'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
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
    }
}
