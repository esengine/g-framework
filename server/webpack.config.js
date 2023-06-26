const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
        ],
    },
    mode: 'production',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'gs-server.js',
        path: path.resolve(__dirname, 'dist'),
    },
    target: 'node',
    externals: [nodeExternals()],
};
