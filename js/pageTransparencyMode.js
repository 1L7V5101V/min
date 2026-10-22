var settings = require('util/settings/settings.js')
var webviews = require('webviews.js')
var injectedStylesheet = require('util/injectedStylesheet.js')

var button = document.getElementById('page-background-toggle-button')

/*
  Background colours go transparent so the desktop shows through whatever the page paints.
  background-image is left alone on purpose: that is how icons, photos and gradients drawn as
  images survive the rewrite.
*/
var pageSheet = injectedStylesheet('*, *::before, *::after { background-color: transparent !important; }')

/*
  Both facts come from the main process and neither can change while the window is alive:
  capable is whether this window could be transparent, inEffect is whether it was created that way.
*/
var capable = window.globalArgs['page-background-transparent-capable'] === 'true'
var inEffect = window.globalArgs['page-background-transparent'] === 'true'

function initialize () {
  button.hidden = !capable

  button.addEventListener('click', function () {
    settings.set('pageBackgroundTransparent', !(settings.get('pageBackgroundTransparent') === true))
  })

  // the button shows the armed state, which only takes effect on the next launch
  settings.listen('pageBackgroundTransparent', function (value) {
    button.setAttribute('aria-pressed', String(value === true))
  })

  if (inEffect) {
    document.body.classList.add('page-background-transparent')

    pageSheet.setWanted(true)
    webviews.bindEvent('dom-ready', pageSheet.onDocumentReady)
    pageSheet.applyToAllTabs()
  }
}

module.exports = { initialize }
