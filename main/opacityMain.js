/*
  Opacity is per-window: the slider changes only the window it lives in, and a new window starts
  from the value the window that opened it is using. The setting holds the last value anyone dialed
  to, which is what the first window of the next launch starts from.

  Electron implements this only on Windows and macOS; a call on Linux is silently ignored, so the
  control that writes it is hidden there.
*/

function getWindowOpacity (win) {
  if (!win) {
    return 1
  }

  // getState throws for a window that isn't registered yet, so the entry is looked up directly
  var entry = windows.openWindows.find(function (w) { return w.win === win })

  return entry && typeof entry.state.windowOpacity === 'number' ? entry.state.windowOpacity : 1
}

function applyWindowOpacity (win, value) {
  win.setOpacity(value)
  windows.getState(win).windowOpacity = value
}
