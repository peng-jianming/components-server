const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');
const nodeExcternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist')
  },
  module: {
    // 解决Critical dependency: require function is used in a way in which dependencies cannot be statically extracted的问题
    unknownContextCritical: false,
    // 解决the request of a dependency is an expression
    exprContextCritical: false,
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'thread-loader',
          { loader: 'babel-loader', options: { cacheDirectory: true } }
        ]
      }
    ]
  },
  externals: [nodeExcternals()],
  plugins: [
    new CleanWebpackPlugin({}),
    new ProgressBarPlugin({
      format: `  build [:bar]  ${chalk.green.bold(
        ':percent'
      )} (:elapsed seconds) :msg`,
      clear: true
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    timings: true,
    chunkModules: false,
    entrypoints: false
  },
  node: {
    console: true,
    global: true,
    process: true,
    __filename: true,
    __dirname: true,
    Buffer: true,
    setImmediate: true
  },
  optimization: {
    splitChunks: {
      chunks: 'initial',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      cacheGroups: {
        default: {
          name: 'manifest',
          chunks: 'initial',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true
        },
        defaultVendor: {
          name: 'vendor',
          test: /node_modules/,
          chunks: 'initial',
          priority: 20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
