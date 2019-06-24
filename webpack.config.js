const path = require('path');
module.exports = {
  mode: 'production',
  entry: './index.ts',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: require.resolve('babel-loader'),
        exclude: /node-modules/
      },
      {
        test: /\.tsx?$/,
        loader: require.resolve('awesome-typescript-loader'),
        exclude: /node-modules/
      }
    ]
  },
  externals: {
    jquery: '$',
    ejs: 'ejs'
  }
};
