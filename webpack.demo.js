const path = require('path');
const config = require('./webpack.config.js');
module.exports = {
  ...config,
  mode: 'development',
  entry: './controller/demo.ts',
  output: {
    path: path.join(__dirname, 'controller'),
    filename: 'bundle.js'
  }
};
