/*
  The setting is the single source of truth for always-on-top: whatever changes it, the menu item
  or the navbar button, only writes the value, and the listener below is what moves the windows.
*/

function getAlwaysOnTop () {
  return settings.get('windowAlwaysOnTop') === true
}

function applyAlwaysOnTop () {
  var onTop = getAlwaysOnTop()

  windows.getAll().forEach(function (win) {
    win.setAlwaysOnTop(onTop)
  })
}

app.on('ready', function () {
  settings.listen('windowAlwaysOnTop', applyAlwaysOnTop)
})
