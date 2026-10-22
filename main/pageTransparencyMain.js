/*
  Whether this window could be made transparent at all: Electron honours transparent only for a
  frameless window on Windows, and Linux needs compositor setup Electron doesn't do for us.
  Because it is a create-time option, turning the mode on takes effect on the next launch.
*/
function pageBackgroundIsCapable () {
  return settings.get('useSeparateTitlebar') !== true &&
    (process.platform === 'win32' || process.platform === 'darwin')
}

function pageBackgroundIsTransparent () {
  return pageBackgroundIsCapable() && settings.get('pageBackgroundTransparent') === true
}

/*
  Every layer between the page and the desktop has to let light through: the window itself, the
  chrome view that covers the whole window, and the tab view on top of it.
*/
function transparentBackgroundColour () {
  return pageBackgroundIsTransparent() ? '#00000000' : '#fff'
}
