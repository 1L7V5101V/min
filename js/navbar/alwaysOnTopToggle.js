var ipcRenderer = require('electron').ipcRenderer

var button = document.getElementById('always-on-top-toggle-button')

function initialize () {
  button.addEventListener('click', function () {
    var onTop = button.getAttribute('aria-pressed') !== 'true'

    button.setAttribute('aria-pressed', String(onTop))
    ipcRenderer.invoke('setWindowAlwaysOnTop', onTop)
  })

  // this window's own value, handed over at startup; the shared setting is only what the next
  // launch's first window starts from
  button.setAttribute('aria-pressed', String(window.globalArgs['window-always-on-top'] === 'true'))
}

module.exports = { initialize }
