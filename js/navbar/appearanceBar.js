var webviews = require('webviews.js')

var bar = document.getElementById('appearance-bar')

function initialize () {
  /*
    The tab view is a native surface above this document, so it keeps painting over the strip unless
    it's told to stop short of it. The height is measured rather than repeated here, so css/tabBar.css
    stays the only place that decides how tall the strip is.
  */
  webviews.adjustMargin([0, 0, Math.round(bar.getBoundingClientRect().height), 0])
}

module.exports = { initialize }
