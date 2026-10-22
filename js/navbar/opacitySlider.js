var ipcRenderer = require('electron').ipcRenderer

var slider = document.getElementById('opacity-slider')

function initialize () {
  if (window.platformType === 'linux') {
    // the main process ignores opacity on Linux, so there is nothing to control here
    slider.hidden = true
    return
  }

  var value = parseFloat(window.globalArgs['window-opacity'])

  // this window's own value, which the main process hands over at startup; the shared setting is
  // only what the first window of the next launch starts from
  slider.value = Math.round((isNaN(value) ? 1 : value) * 100)

  slider.addEventListener('input', function () {
    ipcRenderer.invoke('setWindowOpacity', parseInt(this.value) / 100)
  })
}

module.exports = { initialize }
