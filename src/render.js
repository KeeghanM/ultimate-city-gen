// IMPORTS AND CONSTS
const { p5 } = require("p5")
const { town } = require("./Towns/Town")
const { voronoi } = require("@zbryikt/voronoijs")
const { closeSync } = require("original-fs")
const COLORS = {
  dark: "#333",
  light: "#999",
  primary: "#F4A259",
  accent: "#5B8E7D",
  danger: "#BC4B51",
  success: "#8CB369",
}
const UI_BAR_HEIGHT = 50

// ZOOM AND PAN
const zoomSensitivity = 0.1
let currentScale = 1
let transformX = 0
let transformY = 0
let isMouseDragged = false
let mousePressedX = null
let mousePressedY = null
const mouseDragDetectionThreshold = 10

// UI ELEMENTS
let btn_addWall, btn_hand
let btnList = []

// GROUPS
let wallSites = []

// General Variables
let mode = "hand"

function setup() {
  createCanvas(windowWidth, windowHeight)

  // Create UI Bar
  btn_hand = createButton("✋").mousePressed(handMode)
  btn_hand.position(0, 0)
  btn_hand.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_hand.addClass("active")

  btn_addWall = createButton("🧱").mousePressed(addWallMode)
  btn_addWall.position(50, 0)
  btn_addWall.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)

  btnList.push(btn_hand)
  btnList.push(btn_addWall)
}

function draw() {
  noStroke()
  background(COLORS.dark)
  // UI ELEMENTS
  fill(0)
  rect(0, 0, windowWidth, UI_BAR_HEIGHT)

  push()
  translate(transformX, transformY)
  scale(currentScale)
  // DO ALL DRAWING HERE
  fill(COLORS.primary)
  for (i = 0; i < wallSites.length; i++) {
    let site = wallSites[i]
    let nextI = i + 1 == wallSites.length ? 0 : i + 1
    ellipse(site.x, site.y, 15)
    stroke(COLORS.primary)
    line(site.x, site.y, wallSites[nextI].x, wallSites[nextI].y)
  }
  pop()
}

function registeredClick(mouseBtn) {
  let t_mouseX = (mouseX - transformX) / currentScale
  let t_mouseY = (mouseY - transformY) / currentScale

  if (mode == "wall") {
    if (mouseBtn === LEFT) {
      wallSites.push({
        x: t_mouseX,
        y: t_mouseY,
      })
    } else if (mouseBtn === RIGHT) {
      // Remove closest wall site - if within 15 pixels
      let distance = Infinity
      let closest = undefined
      for (let site of wallSites) {
        let curDist = distanceBetween(t_mouseX, t_mouseY, site.x, site.y)
        if (curDist < distance) {
          distance = curDist
          closest = site
        }
      }
      if (closest && distance < 15) {
        let index = wallSites.indexOf(closest)
        wallSites.splice(index, 1)
      }
    }
    wallSites = clockwiseOrder(wallSites)
  }
}

function handMode() {
  for (let btn of btnList) btn.removeClass("active")
  mode = "hand"
  btn_hand.addClass("active")
}

function addWallMode() {
  for (let btn of btnList) btn.removeClass("active")
  mode = "wall"
  btn_addWall.addClass("active")
}

// HELPERS
function distanceBetween(x1, y1, x2, y2) {
  var a = x1 - x2
  var b = y1 - y2

  return Math.sqrt(a * a + b * b)
}

function clockwiseOrder(points) {
  const center = points.reduce(
    (acc, { x, y }) => {
      acc.x += x / points.length
      acc.y += y / points.length
      return acc
    },
    { x: 0, y: 0 }
  )

  // Add an angle property to each point using tan(angle) = y/x
  const angles = points.map(({ x, y }) => {
    return {
      x,
      y,
      angle: (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI,
    }
  })

  // Sort your points by angle
  const pointsSorted = angles.sort((a, b) => a.angle - b.angle)

  return pointsSorted
}

// PAN AND ZOOM LOGIC
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
  if (!isMouseDragged && mouseY > UI_BAR_HEIGHT) {
    registeredClick(mouseButton)
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
