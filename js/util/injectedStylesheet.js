var webviews = require('webviews.js')

/*
  One injected stylesheet per tab.

  insertCSS hands back a key, and that key is the only way to take the sheet out again. A key
  belongs to a single document, so navigating means forgetting the key and inserting again once
  the new document is ready.
*/
function injectedStylesheet (css) {
  var keys = {}
  var wanted = false

  function remove (tabId) {
    var key = keys[tabId]

    if (!key) {
      return
    }

    delete keys[tabId]

    webviews.callAsync(tabId, 'removeInsertedCSS', [key])
  }

  function insert (tabId) {
    if (keys[tabId] || !webviews.hasViewForTab(tabId)) {
      return
    }

    webviews.callAsync(tabId, 'insertCSS', [css], function (error, key) {
      if (error || !key) {
        return
      }

      keys[tabId] = key

      // the mode may have been switched off again while this call was on its way
      if (!wanted) {
        remove(tabId)
      }
    })
  }

  return {
    setWanted: function (value) {
      wanted = value === true
    },
    applyToTab: function (tabId) {
      if (wanted) {
        insert(tabId)
      }
    },
    applyToAllTabs: function () {
      tasks.forEach(function (task) {
        task.tabs.forEach(function (tab) {
          if (wanted) {
            insert(tab.id)
          } else {
            remove(tab.id)
          }
        })
      })
    },
    // the old document took its stylesheet with it, so only the key is stale here
    onDocumentReady: function (tabId) {
      delete keys[tabId]

      insert(tabId)
    }
  }
}

module.exports = injectedStylesheet
