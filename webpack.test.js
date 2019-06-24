const path = require('path');
const config = require('./webpack.config.js');
module.exports = {
  ...config,
  mode: 'development',
  entry: './test/index.js',
  output: {
    path: path.join(__dirname, 'test'),
    filename: 'bundle.js'
  }
};
