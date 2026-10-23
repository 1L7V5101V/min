var ipcRenderer = require('electron').ipcRenderer

var button = document.getElementById('screen-capture-button')

function initialize () {
  button.addEventListener('click', function () {
    ipcRenderer.send('screen-capture-start')
  })
}

module.exports = { initialize }
