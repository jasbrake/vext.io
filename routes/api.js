const router = require('express').Router()
const readline = require('readline')
const fs = require('fs')
const maxmind = require('maxmind')
const ip = require('ip')
const {ObjectID} = require('mongodb')
const _ = require('lodash')

const {User} = require('../db/models/User')
const {authenticate, authenticateAdmin} = require('../middleware/authenticate')

const countryGeoIP = maxmind.openSync(process.env.GEOIP_DB_PATH, {
  watchForUpdates: true,
  cache: {
    max: 1000,
    maxAge: 1000 * 60 * 60
  }
})

router.post('/users', (req, res) => {
  const body = _.pick(req.body, ['name', 'email', 'password'])
  const user = new User(body)

  user.save().then(() => {
    return user.generateAuthToken(req.ip)
  }).then(token => {
    res.header('x-auth', token).json(user)
  }).catch(e => {
    console.log(e)
    res.status(400).send(e)
  })
})

router.get('/users', authenticateAdmin, (req, res) => {
  User.find().then((users) => {
    res.json({users})
  }).catch(e => {
    res.status(400).send(e)
  })
})

router.get('/users/me', authenticate, (req, res) => {
  res.json(req.user)
})

router.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])

  User.findByCredentials(body.email, body.password).then(user => {
    return user.generateAuthToken(req.ip).then(token => {
      res.header('x-auth', token).json(user)
    })
  }).catch(e => {
    res.status(400).send()
  })
})

router.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }).catch(e => {
    res.status(400).send()
  })
})

router.get('/users/:id', (req, res) => {
  const id = req.params.id

  if (!ObjectID.isValid(id)) { return res.status(404).send() }

  User.findById(id).then(user => {
    if (!user) { res.status(404).send() }
    res.json({user})
  }).catch(e => {
    res.status(400).send()
  })
})

router.delete('/users/:id', (req, res) => {
  const id = req.params.id

  if (!ObjectID.isValid(id)) { return res.status(404).send() }

  User.findByIdAndRemove(id).then(user => {
    if (!user) { res.status(404).send() }
    res.json({user})
  }).catch(e => {
    res.status(400).send()
  })
})

router.get('/whois', authenticate, (req, res) => {
  let query = req.query.q
  let mode = req.query.m
  const lines = []

  let cidrSubnet = null
  let regex = null
  try {
    if (mode === 'cidr') cidrSubnet = ip.cidrSubnet(query)
    if (mode === 'regex') regex = new RegExp(query)
  } catch (e) {
    console.log(e)
    if (mode === 'cidr') res.json({error: `Invalid CIDR subnet: ${query}`})
    if (mode === 'regex') res.json({error: `Error parsing RegExp: ${query}`})
    return
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(process.env.USERS_LOG),
    terminal: false
  })

  rl.on('line', (line) => {
    const values = line.split('\t')
    let match = false

    switch (mode) {
      case 'text':
        match = ~line.indexOf(query)
        break
      case 'regex':
        match = regex.test(line)
        break
      case 'cidr':
        match = cidrSubnet.contains(values[0])
        break
      default:
        break
    }

    if (match) {
      const data = {}
      data.ip = values[0]
      data.dec = ip.toLong(data.ip)
      data.name = values[1]
      const geoip = countryGeoIP.get(data.ip)
      data.country = (geoip.country) ? geoip.country.names.en : ''
      lines.push(data)
    }
  })

  rl.on('close', () => res.json(lines))
})

module.exports = router
