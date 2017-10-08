const axios = require('axios')
const jwtDecode = require('jwt-decode')

const loginForm = document.querySelector('#login-form')
const token = localStorage.getItem('vext.io x-auth token')
if (token) {
  loginForm.style.display = 'none'
  setLoggedInMessage(token)
} else {
  loginForm.addEventListener('submit', ev => {
    ev.preventDefault()
    const emailInput = document.querySelector('#login-email-input')
    const passwordInput = document.querySelector('#login-password-input')
    const email = emailInput.value
    const password = passwordInput.value

    emailInput.value = ''
    passwordInput.value = ''

    axios.post('/api/users/login', {email, password}).then(res => {
      console.log(res)
      localStorage.setItem('vext.io x-auth token', res.headers['x-auth'])
      loginForm.style.display = 'none'
      setLoggedInMessage(res.headers['x-auth'])
    }).catch(e => {
      console.log(e)
    })
  }, false)
}

function setLoggedInMessage (token) {
  const name = jwtDecode(token).name
  document.querySelector('#logged-in-user').textContent = name
  document.querySelector('#logged-in').style.display = ''
  document.querySelector('#logout a').onclick = logout
}

function logout (ev) {
  ev.preventDefault()
  const token = localStorage.getItem('vext.io x-auth token')
  if (!token) { return }
  axios.delete('/api/users/me/token', {headers: {'x-auth': token}})
  localStorage.removeItem('vext.io x-auth token')
  document.querySelector('#logged-in').style.display = 'none'
  loginForm.style.display = ''
}
