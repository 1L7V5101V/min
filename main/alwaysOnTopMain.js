/*
  Always-on-top belongs to one window: pinning one window shouldn't pin the others. A new window
  starts from the value of the window that opened it, and the setting holds the last value anyone
  used, which is what the first window of the next launch starts from.
*/

function getWindowAlwaysOnTop (win) {
  if (!win) {
    return false
  }

  // getState throws for a window that isn't registered yet, so the entry is looked up directly
  var entry = windows.openWindows.find(function (w) { return w.win === win })

  return !!(entry && entry.state.windowAlwaysOnTop)
}

function applyWindowAlwaysOnTop (win, value) {
  win.setAlwaysOnTop(!!value)
  windows.getState(win).windowAlwaysOnTop = !!value
}
