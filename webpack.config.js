const path = require('path');
module.exports = {
  mode: 'development',
  entry: './index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: require.resolve('babel-loader'),
        exclude: [
          path.resolve(__dirname, 'jquery.js'),
          path.resolve(__dirname, 'node_modules/jquery')
        ]
      }
    ]
  }
};
