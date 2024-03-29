const zoomSensitivity = 0.1
let currentScale = 1
let transformX = 0
let transformY = 0
let isMouseDragged = false
let mousePressedX = null
let mousePressedY = null
const mouseDragDetectionThreshold = 10
let UI_BAR_HEIGHT = 100
let selected_pane = undefined

function mousePressed() {
  loop()
  mousePressedX = mouseX
  mousePressedY = mouseY

  for (let i = panes.length - 1; i >= 0; i--) {
    let pane = panes[i]
    if (pane.clicked()) {
      pane.moveToTop()
      pane.setOffset(mouseX, mouseY)
      selected_pane = pane
      break
    }
  }
}

function mouseWheel(event) {
  loop()
  if (keyIsDown(CONTROL)) {
    zoomScroll(event)
  } else if (current_status == "draw_roads") {
    changeRoadAddSize(event)
  }
  return false
}

function mouseDragged() {
  if (selected_pane) {
    selected_pane.setPosition(mouseX, mouseY)
    selected_pane.moveToTop()
  } else if (
    dist(mousePressedX, mousePressedY, mouseX, mouseY) >
      mouseDragDetectionThreshold &&
    mouseY > UI_BAR_HEIGHT
  ) {
    isMouseDragged = true
    transformX += mouseX - pmouseX
    transformY += mouseY - pmouseY
  }
}

function mouseReleased() {
  if (!isMouseDragged && mouseY > UI_BAR_HEIGHT) {
    registeredClick(mouseButton)
  }
  mousePressedX = null
  mousePressedY = null
  isMouseDragged = false

  selected_pane = undefined
  if (current_status != "draw_roads") {
    noLoop()
  }
}

function zoomScroll(event) {
  // Determine the scale factor based on zoom sensitivity
  let scaleFactor = null
  if (event.delta < 0) {
    scaleFactor = 1 + zoomSensitivity
  } else {
    scaleFactor = 1 - zoomSensitivity
  }

  // Apply transformation and scale incrementally
  currentScale = currentScale * scaleFactor
  transformX = mouseX - mouseX * scaleFactor + transformX * scaleFactor
  transformY = mouseY - mouseY * scaleFactor + transformY * scaleFactor
}
