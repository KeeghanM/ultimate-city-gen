// IMPORTS AND CONSTS
const { ipcRenderer } = require("electron")
const { p5 } = require("p5")
const { town } = require("./Towns/Town")
const { voronoi } = require("@zbryikt/voronoijs")
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
let btn_addWall, btn_hand, btn_addDistrict, btn_addBlock, btn_addBuilding
let btnList = []

// GROUPS
let wallSites = []
let districts = []
let blocks = []

// General Variables
let mode = "hand"

function setup() {
  createCanvas(windowWidth, windowHeight)

  // Create UI Bar
  createFunctionButtons()
}

function draw() {
  updateFunctionButtons()
  noStroke()
  background(COLORS.dark)

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

  // UI ELEMENTS
  fill(0)
  rect(0, 0, windowWidth, UI_BAR_HEIGHT)
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

// MODE SETTING
function setMode(md) {
  mode = md
  for (let btn of btnList) {
    btn.removeClass("active")
    if (btn.id() === "btn-" + md) btn.addClass("active")
  }
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

// UI ELEMENTS
function updateFunctionButtons() {
  if (wallSites.length < 3) {
    btn_addDistrict.attribute("disabled", "")
  } else {
    btn_addDistrict.removeAttribute("disabled")
  }

  if (districts.length < 1) {
    btn_addBlock.attribute("disabled", "")
  } else {
    btn_addBlock.removeAttribute("disabled")
  }

  if (blocks.length < 1) {
    btn_addBuilding.attribute("disabled", "")
  } else {
    btn_addBuilding.removeAttribute("disabled")
  }
}

function createFunctionButtons() {
  btn_hand = createButton("✋").mousePressed(() => setMode("hand"))
  btn_hand.position(0, 0)
  btn_hand.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_hand.addClass("active")
  btn_hand.id("btn-hand")

  btn_addWall = createButton("🧱").mousePressed(() => setMode("wall"))
  btn_addWall.position(50, 0)
  btn_addWall.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_addWall.id("btn-wall")

  btn_addDistrict = createButton("🚧").mousePressed(() => setMode("district"))
  btn_addDistrict.position(100, 0)
  btn_addDistrict.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_addDistrict.id("btn-district")

  btn_addBlock = createButton("🔳").mousePressed(() => setMode("block"))
  btn_addBlock.position(150, 0)
  btn_addBlock.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_addBlock.id("btn-block")

  btn_addBuilding = createButton("🏛️").mousePressed(() => setMode("building"))
  btn_addBuilding.position(200, 0)
  btn_addBuilding.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_addBuilding.id("btn-building")

  btnList.push(btn_hand)
  btnList.push(btn_addWall)
  btnList.push(btn_addDistrict)
  btnList.push(btn_addBlock)
  btnList.push(btn_addBuilding)

  tippy("#btn-hand", {
    content: "Hand Mode",
    arrow: true,
    placement: "bottom",
    theme: "light",
  })
  tippy("#btn-wall", {
    content: "Add Walls (left click to add, right click to remove)",
    arrow: true,
    placement: "bottom",
    theme: "light",
  })
  tippy("#btn-district", {
    content: "Add Districts (left click to add, right click to remove)",
    arrow: true,
    placement: "bottom",
    theme: "light",
  })
  tippy("#btn-block", {
    content: "Add Blocks (left click to add, right click to remove)",
    arrow: true,
    placement: "bottom",
    theme: "light",
  })
  tippy("#btn-building", {
    content: "Add Buildings (left click to add, right click to remove)",
    arrow: true,
    placement: "bottom",
    theme: "light",
  })
}
