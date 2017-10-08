const axios = require('axios')

const registerForm = document.querySelector('#register-form')
const errorMessage = document.querySelector('#error-message')

registerForm.addEventListener('submit', ev => {
  ev.preventDefault()
  const name = document.querySelector('#name-input').value
  const email = document.querySelector('#email-input').value
  const password = document.querySelector('#password-input').value

  if (!name || !email || !password) { return }

  axios.post('/api/users', {name, email, password})
    .then(res => {
      localStorage.setItem('vext.io x-auth token', res.headers['x-auth'])
      window.location.href = '/'
    })
    .catch(e => {
      errorMessage.textContent = 'Registration failed!'
    })
})
