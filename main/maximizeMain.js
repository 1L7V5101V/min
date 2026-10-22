/*
  A transparent window on Windows never reports its own maximized state: isMaximized() stays
  false, unmaximize() and restore() do nothing, and the unmaximize event is never emitted. So the
  bounds from before maximizing are kept here and restoring is done by hand. Non-transparent
  windows fall through to the native calls, which still work.
*/

var tracked = new WeakMap() // win -> { manual, maximized, normalBounds }

function fillsWorkArea (bounds) {
  var workArea = electron.screen.getDisplayMatching(bounds).workArea

  return Math.abs(bounds.x - workArea.x) <= 2 &&
    Math.abs(bounds.y - workArea.y) <= 2 &&
    Math.abs(bounds.width - workArea.width) <= 2 &&
    Math.abs(bounds.height - workArea.height) <= 2
}

function trackMaximizeState (win) {
  var state = {
    manual: pageBackgroundIsTransparent(),
    maximized: false,
    normalBounds: win.getBounds()
  }

  tracked.set(win, state)

  if (!state.manual) {
    return
  }

  win.on('maximize', function () {
    state.maximized = true
  })

  var record = function () {
    var bounds = win.getBounds()

    /*
      While maximized the bounds are the work area, so only record from a normal window. The
      geometric check is needed as well as the flag: maximizing emits resize before it emits
      maximize, and a transparent window never reports its own maximized state.
    */
    if (!state.maximized && !fillsWorkArea(bounds)) {
      state.normalBounds = bounds
    }
  }

  win.on('resize', record)
  win.on('move', record)
}

function isManuallyTracked (win) {
  var state = tracked.get(win)

  return !!state && state.manual
}

function maximizeWindow (win) {
  if (!isManuallyTracked(win)) {
    win.maximize()
    return
  }

  var state = tracked.get(win)

  if (state.maximized) {
    return
  }

  state.normalBounds = win.getBounds()
  win.maximize()
}

function unmaximizeWindow (win) {
  if (!isManuallyTracked(win)) {
    win.unmaximize()
    return
  }

  var state = tracked.get(win)

  if (!state.maximized) {
    return
  }

  win.setBounds(state.normalBounds)
  state.maximized = false
}

function windowIsMaximized (win) {
  if (!isManuallyTracked(win)) {
    return win.isMaximized()
  }

  return tracked.get(win).maximized === true
}
