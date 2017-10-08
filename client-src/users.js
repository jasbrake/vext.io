const axios = require('axios')

const token = localStorage.getItem('vext.io x-auth token')

axios.get('/api/users', {headers: {'x-auth': token}})
  .then(res => {
    $('#response_table').show()
    const users = res.data.users
    if (users.length > 0) {
      const table = $('#response')
      users.forEach(user => {
        table.append(`<tr><td>${user.name}</td><td>${user.email}</td><td>${user.role}</td><td>${user.enabled}</td></tr>`)
      })
    }
  })
  .catch(e => {
    $('#message').text('Only administrators have permission to manage users.')
  })
