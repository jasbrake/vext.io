const {User} = require('../db/models/User')

const authenticate = (req, res, next) => {
  const token = req.header('x-auth')

  User.findByToken(token).then((user) => {
    if (!user) { return Promise.reject(new Error('User not found')) }
    if (user.enabled !== true) { return Promise.reject(new Error(`User account ${user.email} is not enabled`))}

    req.user = user
    req.token = token
    next()
  }).catch(e => {
    res.status(401).send()
  })
}

const authenticateAdmin = (req, res, next) => {
  const token = req.header('x-auth')

  User.findByToken(token).then((user) => {
    if (!user) { return Promise.reject(new Error('User not found')) }
    if (user.enabled !== true) { return Promise.reject(new Error(`User account ${user.email} is not enabled`))}
    if (user.role !== 'admin' && user.role !== 'owner') {
      return Promise.reject(new Error('User does not have permission'))
    }

    req.user = user
    req.token = token
    next()
  }).catch(e => {
    res.status(401).send()
  })
}

module.exports = {authenticate, authenticateAdmin}