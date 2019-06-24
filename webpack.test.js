const path = require('path');
const config = require('./webpack.config.js');
module.exports = {
  ...config,
  mode: 'development',
  entry: './test/index.ts',
  output: {
    path: path.join(__dirname, 'test'),
    filename: 'bundle.js'
  }
};
