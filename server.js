require('dotenv').config()
const express = require('express')
const path = require('path')
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const app = express()
const server = require('http').createServer(app)

const {mongoose} = require('./db/mongoose')
const apiRouter = require('./routes/api')
const pagesRouter = require('./routes/pages')

// Middleware
app.use(helmet())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(bodyParser.json())

app.set('trust proxy', true)

// Static directories
app.use('/static', express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', pagesRouter)
// Logging
app.use(morgan('short'))

app.use('/api', apiRouter)

server.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}...`)
})

module.exports = {app}
