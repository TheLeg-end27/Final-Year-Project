'use strict'
const path = require('path');
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './map/static/myapp/map.js', 
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './map/static/dist'), 
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './map/templates/registration/login.html' })
  ],
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer
                ]
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ],
      },
    ],
  },
  resolve: {
    fallback: {
        "fs": false
    },
    }
};
