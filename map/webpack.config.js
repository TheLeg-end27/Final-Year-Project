const path = require('path');

module.exports = {
  entry: './map/static/myapp/map.js', 
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './map/static/dist'), 
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    fallback: {
        "fs": false
    },
    }
};
