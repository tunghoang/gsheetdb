var path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    gsheetdb: './src/gsheetdb.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'var',
    library: 'gsheetdb'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env'
              ]
            ]
          }
        }
      }
    ]
  }
}
