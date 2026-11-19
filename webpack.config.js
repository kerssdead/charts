const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

const base = {
    entry: './src/OCharts.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'ocharts.js',
        clean: { keep: /ocharts\.esm\.js/ }
    },
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        compilerOptions: { module: 'ESNext', moduleResolution: 'bundler', isolatedModules: false }
                    }
                },
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                // https://terser.org/docs/options/
                terserOptions: {
                    ecma: 2021,
                    compress: {
                        passes: 2
                    }
                },
            })
        ]
    }
}

module.exports = [
    base,
    {
        ...base,
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'ocharts.esm.js',
            library: { type: 'module' }
        },
        experiments: { outputModule: true }
    }
]