const { p5 } = require("p5")
const { town } = require("./Towns/Town")
const COLORS = {
  dark: "#333",
  light: "#999",
  primary: "#F4A259",
  accent: "#5B8E7D",
  danger: "#BC4B51",
  success: "#8CB369",
}

let circles = []

// ZOOM AND PAN
const zoomSensitivity = 0.1
let currentScale = 1
let transformX = 0
let transformY = 0

// MOUSE DRAG DETECTION
let isMouseDragged = false
let mousePressedX = null
let mousePressedY = null
const mouseDragDetectionThreshold = 10

function setup() {
  createCanvas(windowWidth, windowHeight)
}

function draw() {
  // UI ELEMENTS

  noStroke()
  background(COLORS.dark)
  fill(COLORS.primary)

  push()
  translate(transformX, transformY)
  scale(currentScale)
  // DO ALL DRAWING HERE
  circles.forEach((circle) => ellipse(circle.x, circle.y, circle.r, circle.r))

  pop()
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

function mousePressed() {
  mousePressedX = mouseX
  mousePressedY = mouseY
}

function mouseDragged() {
  if (
    dist(mousePressedX, mousePressedY, mouseX, mouseY) >
    mouseDragDetectionThreshold
  ) {
    isMouseDragged = true
    transformX += mouseX - pmouseX
    transformY += mouseY - pmouseY
  }
}

function mouseReleased() {
  if (!isMouseDragged) {
    // Push a circle that will be drawn on the screen
    // Reverse the transformation and scale while storing the coordinates
    circles.push({
      x: (mouseX - transformX) / currentScale,
      y: (mouseY - transformY) / currentScale,
      r: random(5, 100),
    })
  }
  mousePressedX = null
  mousePressedY = null
  isMouseDragged = false
}

function mouseWheel(event) {
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

  // Disable page scroll
  return false
}
