const axios = require('axios')
const tablesort = require('tablesort')

let sort = null

// $(function () {
$('#whois_form').submit(function () {
  const query = $('#whois_input').val().trim()
  if (query) {
    const mode = $('input[name=mode]:checked').val()
    const caseInsensitive = $('#case_insensitive').is(':checked')

    let url = ''
    url += (query) ? '/whois?q=' + encodeURIComponent(query) : ''
    url += (mode) ? '&m=' + mode : ''
    url += (caseInsensitive) ? '&ci=1' : ''

    if (url) { window.location.href = url }
  }
  return false
})

// Setup table sorting
sort = tablesort(document.getElementById('response_table'))

// On page load, execute whois ajax request if the right params exist
const searchParams = new URLSearchParams(window.location.search)
const query = searchParams.get('q')
const mode = searchParams.get('m')
const caseInsensitive = searchParams.get('ci')

if (query) $('#whois_input').val(query)
if (mode) $('input[name=mode][value=' + mode + ']').attr('checked', true)
if (caseInsensitive) $('#case_insensitive').attr('checked', true)

if (query && mode) {
  executeWhoisSearch(query, mode, caseInsensitive)
}
// })

function executeWhoisSearch (query, mode, caseInsensitive) {
  if (query) {
    axios.get('/api/whois', {
      headers: {
        'x-auth': localStorage.getItem('vext.io x-auth token')
      },
      params: {
        q: query,
        m: mode,
        ci: caseInsensitive
      }
    })
    .then(res => {
      if (res.data.error) {
        console.error(res.data.error)
        $('#message').text(res.data.error)
      } else {
        $('#response_table').show()
        if (res.data.length > 0) {
          res.data.forEach(d => {
            $('#response').append(`<tr><td data-sort='${d.dec}'><a href='/whois?q=${d.ip}&m=text'>${d.ip}</a></td><td><a href='/whois?q=${d.name}&m=text'>${d.name}</a></td><td>${d.country}</td></tr>`)
          })
          if (sort) {
            sort.refresh()
          }
        }
      }
    })
    .catch(e => {
      if (e.response.status === 401) {
        $('#message').text('Invalid credentials. Try logging in or asking an administrator to activate your account.')
      } else {
        console.error(e)
      }
    })
  }
}
