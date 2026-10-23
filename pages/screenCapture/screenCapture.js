var ipcRenderer = require('electron').ipcRenderer

var selection = document.getElementById('selection')
var startX = 0
var startY = 0
var dragging = false

function box (x1, y1, x2, y2) {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1)
  }
}

function paint (rect) {
  selection.style.display = 'block'
  selection.style.left = rect.x + 'px'
  selection.style.top = rect.y + 'px'
  selection.style.width = rect.width + 'px'
  selection.style.height = rect.height + 'px'
}

document.addEventListener('mousedown', function (e) {
  if (e.button !== 0) {
    return
  }

  dragging = true
  startX = e.clientX
  startY = e.clientY
  paint(box(startX, startY, startX, startY))
})

document.addEventListener('mousemove', function (e) {
  if (dragging) {
    paint(box(startX, startY, e.clientX, e.clientY))
  }
})

document.addEventListener('mouseup', function (e) {
  if (!dragging) {
    return
  }

  dragging = false

  var rect = box(startX, startY, e.clientX, e.clientY)

  /*
    A click without a drag is treated as a way out, the same as Escape: it would otherwise capture a
    rectangle of a couple of pixels.
  */
  if (rect.width < 4 || rect.height < 4) {
    selection.style.display = 'none'
    ipcRenderer.send('screen-capture-cancelled')
    return
  }

  ipcRenderer.send('screen-capture-completed', rect)
})

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    selection.style.display = 'none'
    ipcRenderer.send('screen-capture-cancelled')
  }
})

document.addEventListener('contextmenu', function (e) {
  e.preventDefault()
  selection.style.display = 'none'
  ipcRenderer.send('screen-capture-cancelled')
})
