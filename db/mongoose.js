const mongoose = require('mongoose')

mongoose.Promise = global.Promise

mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('Successfully connected to DB') })
  .catch((e) => { console.error(e) })

module.exports = {mongoose}
