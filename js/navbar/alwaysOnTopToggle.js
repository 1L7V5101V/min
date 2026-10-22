var settings = require('util/settings/settings.js')

var button = document.getElementById('always-on-top-toggle-button')

function initialize () {
  button.addEventListener('click', function () {
    settings.set('windowAlwaysOnTop', !(settings.get('windowAlwaysOnTop') === true))
  })

  settings.listen('windowAlwaysOnTop', function (value) {
    button.setAttribute('aria-pressed', String(value === true))
  })
}

module.exports = { initialize }
