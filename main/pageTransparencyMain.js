/*
  Whether this window could be transparent at all: Electron honours transparent only for a frameless
  window on Windows, and Linux needs compositor setup Electron doesn't do for us. Because it is a
  create-time option, turning the mode on takes effect on the next window that gets created.
*/
function pageBackgroundIsCapable () {
  return settings.get('useSeparateTitlebar') !== true &&
    (process.platform === 'win32' || process.platform === 'darwin')
}

/*
  The value a window starts with when nothing else decides it: the app-wide setting, which is what
  the navbar button writes.
*/
function pageBackgroundIsTransparent () {
  return pageBackgroundIsCapable() && settings.get('pageBackgroundTransparent') === true
}

/*
  Per-window, because transparency is fixed when the window is created and two windows in one
  process can disagree. openWindows is looked up directly rather than through getState, which
  throws for a window that isn't registered yet.
*/
function windowIsTransparent (win) {
  if (!win) {
    return false
  }

  var entry = windows.openWindows.find(function (w) { return w.win === win })

  return !!(entry && entry.state.pageBackgroundTransparent)
}

/*
  Every layer between the page and the desktop has to let light through: the window itself, the
  chrome view that covers the whole window, and the tab view on top of it.
*/
function viewBackgroundColour (win) {
  return windowIsTransparent(win) ? '#00000000' : '#fff'
}
