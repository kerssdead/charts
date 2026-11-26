const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

const dist = path.resolve(__dirname, 'dist')

const base = {
    entry: './src/OCharts.ts',
    mode: 'production',
    devtool: 'source-map',
    cache: { type: 'filesystem' },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        compilerOptions: { module: 'ESNext', moduleResolution: 'bundler' }
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

const umd = {
    ...base,
    name: 'umd',
    output: {
        path: dist,
        filename: 'ocharts.js',
        clean: true
    }
}

const esm = {
    ...base,
    name: 'esm',
    dependencies: ['umd'],
    output: {
        path: dist,
        filename: 'ocharts.esm.js',
        library: { type: 'module' }
    },
    experiments: { outputModule: true }
}

const dev = {
    ...umd,
    name: 'dev',
    mode: 'development',
    output: { ...umd.output, clean: false },
    optimization: { minimize: false }
}

module.exports = (env = {}) => env.dev ? dev : [umd, esm]