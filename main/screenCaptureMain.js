/*
  A screen grabber in the WeChat sense: the button hides every Min window, the user drags a
  rectangle over whatever is on the desktop, and on mouse-up that region is copied to the clipboard.
  The selection outline is hidden before the grab so it isn't part of the image, and nothing else is
  drawn over the desktop while selecting.
*/

var captureWindow = null
var captureDisplay = null
var windowsHiddenForCapture = []

function restoreHiddenWindows () {
  windowsHiddenForCapture.forEach(function (win) {
    if (!win.isDestroyed()) {
      win.show()
    }
  })

  windowsHiddenForCapture = []
}

function closeCaptureWindow () {
  if (captureWindow && !captureWindow.isDestroyed()) {
    captureWindow.close()
  }

  captureWindow = null
}

function startScreenCapture () {
  if (captureWindow) {
    // a capture is already being framed
    return
  }

  captureDisplay = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())

  windowsHiddenForCapture = windows.getAll().filter(function (win) {
    return win.isVisible()
  })
  windowsHiddenForCapture.forEach(function (win) {
    win.hide()
  })

  captureWindow = new BrowserWindow({
    x: captureDisplay.bounds.x,
    y: captureDisplay.bounds.y,
    width: captureDisplay.bounds.width,
    height: captureDisplay.bounds.height,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  captureWindow.loadURL('min://app/pages/screenCapture/index.html')
  captureWindow.once('ready-to-show', function () {
    if (captureWindow) {
      captureWindow.show()
      captureWindow.focus()
    }
  })

  /*
    Closing the window through its own close button, or a crash, still has to bring Min's windows
    back, otherwise they stay hidden with nothing left to click.
  */
  captureWindow.on('closed', function () {
    captureWindow = null

    if (windowsHiddenForCapture.length > 0) {
      restoreHiddenWindows()
    }
  })
}

async function completeScreenCapture (rect) {
  var display = captureDisplay

  closeCaptureWindow()

  /*
    The window has to be gone from the compositor before the screen is grabbed, otherwise the
    outline is inside the captured pixels.
  */
  await new Promise(function (resolve) {
    setTimeout(resolve, 150)
  })

  var scale = display.scaleFactor

  try {
    var sources = await electron.desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: Math.round(display.size.width * scale),
        height: Math.round(display.size.height * scale)
      }
    })

    var source = sources.find(function (s) {
      return String(s.display_id) === String(display.id)
    }) || sources[0]

    if (!source || source.thumbnail.isEmpty()) {
      restoreHiddenWindows()
      return
    }

    var image = source.thumbnail
    var imageSize = image.getSize()
    var crop = {
      x: Math.max(0, Math.round(rect.x * scale)),
      y: Math.max(0, Math.round(rect.y * scale)),
      width: Math.round(rect.width * scale),
      height: Math.round(rect.height * scale)
    }

    /*
      Keep the crop inside the captured image: the thumbnail comes back one pixel shorter than
      requested sometimes (3441x1441 asked, 3441x1440 returned), and a rect that runs past the edge
      gives back an empty image rather than a clipped one.
    */
    crop.width = Math.min(crop.width, imageSize.width - crop.x)
    crop.height = Math.min(crop.height, imageSize.height - crop.y)

    /*
      crop() returns a new NativeImage and leaves the receiver untouched, so the result has to be
      the thing written to the clipboard.
    */
    electron.clipboard.writeImage(image.crop(crop))
  } catch (e) {
    console.warn('screen capture failed', e)
  }

  restoreHiddenWindows()
}

ipc.on('screen-capture-start', function () {
  startScreenCapture()
})

ipc.on('screen-capture-completed', function (e, rect) {
  completeScreenCapture(rect)
})

ipc.on('screen-capture-cancelled', function () {
  closeCaptureWindow()
  restoreHiddenWindows()
})
