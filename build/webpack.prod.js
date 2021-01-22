module.exports = {
  mode: "production",
  optimization: {
    splitChunks: {
      chunks: "initial",
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "~",
      cacheGroups: {
        default: {
          name: "manifest",
          chunks: "initial",
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        },
        defaultVendor: {
          name: "vendor",
          test: /node_modules/,
          chunks: "initial",
          priority: 20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
