const path = require('path');

module.exports = [{
  mode: 'development',

  entry: {
    'site': [
      path.resolve(__dirname, './scripts/cookies.js')
    ],
    'usertype': [
      path.resolve(__dirname, './scripts/usertype.js')
    ],
    'pattern-library': [
      path.resolve(__dirname, '../../../node_modules/@scottish-government/pattern-library/src/scripts/accordion.js'),
      path.resolve(__dirname, '../../../node_modules/@scottish-government/pattern-library/src/scripts/notification-banner.js'),
      path.resolve(__dirname, '../../../node_modules/@scottish-government/pattern-library/src/scripts/side-navigation.js'),
      path.resolve(__dirname, '../../../node_modules/@scottish-government/pattern-library/src/scripts/site-navigation.js'),
      path.resolve(__dirname, '../../../node_modules/@scottish-government/pattern-library/src/scripts/site-search.js')
    ]
  },

  output: {
    path: path.resolve(__dirname, '../resources/site/assets/tradingnation/scripts/'),
    filename: '[name].js'
  }
}, {
  mode: 'development',

  entry: {
    'site': [
      path.resolve(__dirname, './scripts/cookies.js')
    ],
    'usertype': [
      path.resolve(__dirname, './scripts/usertype.js')
    ],
    'pattern-library': [
      path.resolve(__dirname, '../../../node_modules/@scottish-government/pattern-library/src/scripts/accordion.js'),
      path.resolve(__dirname, '../../../node_modules/@scottish-government/pattern-library/src/scripts/notification-banner.js'),
      path.resolve(__dirname, '../../../node_modules/@scottish-government/pattern-library/src/scripts/side-navigation.js'),
      path.resolve(__dirname, '../../../node_modules/@scottish-government/pattern-library/src/scripts/site-navigation.js'),
      path.resolve(__dirname, '../../../node_modules/@scottish-government/pattern-library/src/scripts/site-search.js')
    ]
  },

  output: {
    path: path.resolve(__dirname, '../resources/site/assets/tradingnation/scripts/'),
    filename: '[name].es5.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}];
