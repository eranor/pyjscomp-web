const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, './src/client');

module.exports = {
  mode: 'development',
  entry: {
    app: ['@babel/polyfill', `${SRC_DIR}/main.jsx`],
    vendor: ['react', 'react-dom'],
  },
  output: {
    filename: '[name].chunkhash.bundle.js',
    chunkFilename: '[name].chunkhash.bundle.js',
    path: BUILD_DIR,
    publicPath: '/',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          name: 'vendor',
          test: 'vendor',
          enforce: true,
        },
      },
    },
    runtimeChunk: true,
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
    alias: {
      '@': path.resolve(`${SRC_DIR}/`),
      libs: path.resolve(`${SRC_DIR}/../libs/`),
      routes: path.resolve(`${SRC_DIR}/routes/`),
      components: path.resolve(`${SRC_DIR}/components/`),
      utils: path.resolve(`${SRC_DIR}/utils/`),
    },
  },
  devtool: 'source-map',
  devServer: {
    port: 3000,
    open: true,
    contentBase: __dirname + "/public/",
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/, /libs/],
        use: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([BUILD_DIR]),
    new CopyWebpackPlugin([
      { from: 'node_modules/monaco-editor/min/vs', to: 'vs' },
      { from: 'public', to: 'dist' },
    ]),
    new LodashModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
  ],
};
