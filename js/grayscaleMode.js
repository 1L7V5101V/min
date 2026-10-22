var settings = require('util/settings/settings.js')
var webviews = require('webviews.js')

var button = document.getElementById('grayscale-toggle-button')

/*
  Graying the page through a filter on its root element covers everything the page paints,
  embedded frames included, because those frames are composited into that element. The cost is
  that the root element becomes the containing block for fixed and sticky positioned children, so
  a site that places a toolbar with position: fixed can shift it.
*/
var pageCSS = 'html { filter: grayscale(1) !important; }'

var enabled = false

// tab id -> the key insertCSS handed back, which is the only way to take the stylesheet out again
var insertedCSS = {}

function removePageCSS (tabId) {
  if (!insertedCSS[tabId]) {
    return
  }

  var key = insertedCSS[tabId]
  delete insertedCSS[tabId]

  webviews.callAsync(tabId, 'removeInsertedCSS', [key])
}

function applyPageCSS (tabId) {
  if (!enabled || insertedCSS[tabId] || !webviews.hasViewForTab(tabId)) {
    return
  }

  webviews.callAsync(tabId, 'insertCSS', [pageCSS], function (error, key) {
    if (error || !key) {
      return
    }

    insertedCSS[tabId] = key

    // grayscale may have been switched off again while this call was on its way
    if (!enabled) {
      removePageCSS(tabId)
    }
  })
}

function applyToAllTabs () {
  if (enabled) {
    tasks.forEach(function (task) {
      task.tabs.forEach(function (tab) {
        applyPageCSS(tab.id)
      })
    })
  } else {
    Object.keys(insertedCSS).forEach(removePageCSS)
  }
}

function setEnabled (value) {
  enabled = value === true
  document.body.classList.toggle('grayscale-mode', enabled)
  button.setAttribute('aria-pressed', String(enabled))
  applyToAllTabs()
}

function initialize () {
  button.addEventListener('click', function () {
    settings.set('browserGrayscale', !enabled)
  })

  // navigating builds a new document, and a stylesheet belongs to a single document
  webviews.bindEvent('dom-ready', function (tabId) {
    delete insertedCSS[tabId]
    applyPageCSS(tabId)
  })

  settings.listen('browserGrayscale', setEnabled)
}

module.exports = { initialize }
