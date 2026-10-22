var settings = require('util/settings/settings.js')

var slider = document.getElementById('opacity-slider')

function initialize () {
  if (window.platformType === 'linux') {
    // the main process ignores windowOpacity on Linux, so there is nothing to control here
    slider.hidden = true
    return
  }

  settings.listen('windowOpacity', function (value) {
    var percent = Math.round((typeof value === 'number' ? value : 1) * 100)

    // skip the write while the user is dragging, so the thumb doesn't jump under the pointer
    if (document.activeElement !== slider && parseInt(slider.value) !== percent) {
      slider.value = percent
    }
  })

  slider.addEventListener('input', function () {
    settings.set('windowOpacity', parseInt(this.value) / 100)
  })
}

module.exports = { initialize }
