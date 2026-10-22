var settings = require('util/settings/settings.js')
var webviews = require('webviews.js')
var injectedStylesheet = require('util/injectedStylesheet.js')

var button = document.getElementById('grayscale-toggle-button')

/*
  Graying the page through a filter on its root element covers everything the page paints,
  embedded frames included, because those frames are composited into that element. The cost is
  that the root element becomes the containing block for fixed and sticky positioned children, so
  a site that places a toolbar with position: fixed can shift it.
*/
var pageSheet = injectedStylesheet('html { filter: grayscale(1) !important; }')

function setEnabled (value) {
  var enabled = value === true

  pageSheet.setWanted(enabled)
  document.body.classList.toggle('grayscale-mode', enabled)
  button.setAttribute('aria-pressed', String(enabled))

  pageSheet.applyToAllTabs()
}

function initialize () {
  button.addEventListener('click', function () {
    settings.set('browserGrayscale', !(settings.get('browserGrayscale') === true))
  })

  // navigating builds a new document, and a stylesheet belongs to a single document
  webviews.bindEvent('dom-ready', pageSheet.onDocumentReady)

  settings.listen('browserGrayscale', setEnabled)
}

module.exports = { initialize }
