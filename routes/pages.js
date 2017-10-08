const router = require('express').Router()

router.get('/', (req, res) => {
  res.render('home')
})

router.get('/whois', (req, res) => {
  res.render('whois')
})

router.get('/users', (req, res) => {
  res.render('users')
})

router.get('/register', (req, res) => {
  res.render('register')
})

module.exports = router
