const path = require("path");
const { merge } = require("webpack-merge");
const devConfig = require("./webpack.dev");
const prodConfig = require("./webpack.prod");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const chalk = require("chalk");
const webpack = require("webpack");

const baseConfig = {
  target: "node",
  entry: path.resolve(__dirname, "../src/index.js"),
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "../dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          "thread-loader",
          { loader: "babel-loader", options: { cacheDirectory: true } },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({}),
    new ProgressBarPlugin({
      format: `  build [:bar]  ${chalk.green.bold(
        ":percent"
      )} (:elapsed seconds) :msg`,
      clear: true,
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: process.env.NODE_ENV,
      },
    }),
  ],
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    timings: true,
    chunkModules: false,
    entrypoints: false,
  },
  node: {
    console: true,
    global: true,
    process: true,
    __filename: true,
    __dirname: true,
    Buffer: true,
    setImmediate: true,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "../src"),
    },
    extensions: [".js", ".json"],
  },
};

module.exports = () => {
  const config = process.env.NODE_ENV === "production" ? prodConfig : devConfig;
  return merge(baseConfig, config);
};
