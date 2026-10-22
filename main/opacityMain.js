/*
  Window opacity dims the whole window at once: the frame, the browser chrome and the page text
  all fade by the same amount. Electron implements it only on Windows and macOS, where a call on
  Linux is silently ignored, so the control that writes this setting is hidden on Linux.
*/

function getWindowOpacity () {
  var value = settings.get('windowOpacity')
  return typeof value === 'number' ? value : 1
}

function applyWindowOpacity () {
  var opacity = getWindowOpacity()

  windows.getAll().forEach(function (win) {
    win.setOpacity(opacity)
  })
}

app.on('ready', function () {
  settings.listen('windowOpacity', applyWindowOpacity)
})
