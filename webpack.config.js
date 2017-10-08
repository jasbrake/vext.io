const path = require('path')

module.exports = {
  entry: {
    whois: './client-src/whois.js',
    login: './client-src/login.js',
    users: './client-src/users.js',
    register: './client-src/register.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public')
  }
}
