const path = require('path');
module.exports = {
  mode: 'production',
  entry: './index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: require.resolve('babel-loader')
      }
    ]
  },
  externals: {
    jquery: '$'
  }
};
