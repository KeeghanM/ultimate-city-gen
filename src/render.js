// IMPORTS AND CONSTS
const { ipcRenderer } = require("electron")
const { p5 } = require("p5")
const { Polygon } = require("./Towns/voronoi/polygon")
const { Town } = require("./Towns/town")
const { Site } = require("./Towns/voronoi/site")
const { District } = require("./Towns/district")

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
let btn_addWall,
  btn_hand,
  btn_addDistrict,
  btn_addBlock,
  btn_addBuilding,
  btn_saveWalls,
  btn_details,
  btn_showWalls,
  btn_save,
  btn_labels
let btnList = []
let labelFont

// General Variables
let mode = "hand"
let drawWalls = true
let drawLabels = true
let wallSites = []
let wallPoly
let town = new Town({})

function preload() {
  labelFont = loadFont("./Towns/assets/LinLibertine_RB.ttf")
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  textAlign(CENTER, CENTER)

  // Create UI Bar
  createFunctionButtons()

  // frameRate(1)
}

function draw() {
  updateFunctionButtons()
  noStroke()
  background(COLORS.dark)

  push()
  translate(transformX, transformY)
  scale(currentScale)

  if (town.district) {
    town.district.draw({ size: 4, font: labelFont })
  }

  if (drawWalls) {
    for (i = 0; i < wallSites.length; i++) {
      let site = wallSites[i]
      let nextI = i + 1 == wallSites.length ? 0 : i + 1
      strokeWeight(24)
      stroke(COLORS.light)
      fill(COLORS.light)
      ellipse(site.x, site.y, 60)
      line(site.x, site.y, wallSites[nextI].x, wallSites[nextI].y)
    }
  }

  if (drawLabels && town.district) {
    textSize(30)
    fill(COLORS.dark)
    strokeWeight(2)
    stroke(COLORS.light)
    for (let child of town.district.children) {
      let centre =
        child.poly.points.length > 1 ? child.poly.centre() : child.site
      text(child.name, centre.x, centre.y)
    }
  }

  pop()

  // UI ELEMENTS
  if (town.name) {
    textFont(labelFont)
    noStroke()
    fill(COLORS.primary)
    textSize(72)
    text(town.name, windowWidth / 2, 90)
  }

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
      removeClosest(t_mouseX, t_mouseY, wallSites, 15)
    }
    wallSites = clockwiseOrder(wallSites)
  }

  if (mode == "district") {
    if (mouseBtn === LEFT) {
      if (pointInPolygon(t_mouseX, t_mouseY, wallSites)) {
        let site = new Site(t_mouseX, t_mouseY)
        let newDistrict = new District({ site })
        town.district.children.push(newDistrict)
        town.district.calcV(10)
      }
    } else if (mouseBtn === RIGHT) {
      removeClosest(t_mouseX, t_mouseY, districts, 15)
    }
  }
}

// HELPERS
function removeClosest(x, y, arr, threshold) {
  let distance = Infinity
  let closest = undefined
  for (let item of arr) {
    let curDist = distanceBetween(x, y, item.x, item.y)
    if (curDist < distance) {
      distance = curDist
      closest = item
    }
  }
  if (closest && distance < threshold) {
    let index = arr.indexOf(closest)
    arr.splice(index, 1)
  }
}

function pointInPolygon(x, y, poly) {
  var inside = false
  for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    var xi = poly[i].x,
      yi = poly[i].y
    var xj = poly[j].x,
      yj = poly[j].y

    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}

function setMode(md) {
  mode = md
  for (let btn of btnList) {
    btn.removeClass("active")
    if (btn.id() === "btn-" + md) btn.addClass("active")
  }
}

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
  if (wallSites.length > 3) {
    btn_saveWalls.removeAttribute("disabled")
  }

  if (wallPoly) {
    // We have a functioning town - so switch to that mode
    btn_saveWalls.attribute("disabled", "")
    btn_addWall.attribute("disabled", "")

    // Show district button as well as visual buttons
    btn_addDistrict.removeAttribute("disabled")
    btn_labels.removeAttribute("disabled")
    btn_showWalls.removeAttribute("disabled")
    btn_details.removeAttribute("disabled")
    btn_save.removeAttribute("disabled")
  }

  if (town?.district?.children.length > 0) {
    btn_addBlock.removeAttribute("disabled")
  }

  // if (districts.length < 1) {
  //   btn_addBlock.attribute("disabled", "")
  // } else {
  //   btn_addBlock.removeAttribute("disabled")
  // }

  // if (blocks.length < 1) {
  //   btn_addBuilding.attribute("disabled", "")
  // } else {
  //   btn_addBuilding.removeAttribute("disabled")
  // }
}

function saveWalls() {
  if (wallSites.length > 3) {
    wallPoly = new Polygon(wallSites)
    town.setDistrict(wallPoly)
    setMode("hand")
  }
}

function saveFile() {
  return
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

  btn_saveWalls = createButton("✔️").mousePressed(saveWalls)
  btn_saveWalls.position(100, 0)
  btn_saveWalls.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_saveWalls.id("btn-save-walls")
  btn_saveWalls.attribute("disabled", "")

  btn_addDistrict = createButton("🚧").mousePressed(() => setMode("district"))
  btn_addDistrict.position(50, 0)
  btn_addDistrict.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_addDistrict.id("btn-district")
  btn_addDistrict.attribute("disabled", "")

  btn_addBlock = createButton("🔳").mousePressed(() => setMode("block"))
  btn_addBlock.position(100, 0)
  btn_addBlock.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_addBlock.id("btn-block")
  btn_addBlock.attribute("disabled", "")

  btn_addBuilding = createButton("🏛️").mousePressed(() => setMode("building"))
  btn_addBuilding.position(150, 0)
  btn_addBuilding.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_addBuilding.id("btn-building")
  btn_addBuilding.attribute("disabled", "")

  btn_labels = createButton("🏷️").mousePressed(() => (drawLabels = !drawLabels))
  btn_labels.position(250, 0)
  btn_labels.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_labels.id("btn-labels")
  btn_labels.attribute("disabled", "")

  btn_showWalls = createButton("👁️").mousePressed(
    () => (drawWalls = !drawWalls)
  )
  btn_showWalls.position(300, 0)
  btn_showWalls.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_showWalls.id("btn-draw-walls")
  btn_showWalls.attribute("disabled", "")

  btn_details = createButton("📜").mousePressed(() => setMode("details"))
  btn_details.position(350, 0)
  btn_details.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_details.id("btn-details")
  btn_details.attribute("disabled", "")

  btn_save = createButton("💾").mousePressed(saveFile)
  btn_save.position(450, 0)
  btn_save.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  btn_save.id("btn-save")
  btn_save.attribute("disabled", "")

  // Open details on click 📜

  btnList.push(btn_hand)
  btnList.push(btn_addWall)
  btnList.push(btn_saveWalls)
  btnList.push(btn_addDistrict)
  btnList.push(btn_addBlock)
  btnList.push(btn_addBuilding)
  btnList.push(btn_labels)
  btnList.push(btn_showWalls)
  btnList.push(btn_details)
  btnList.push(btn_save)

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
  tippy("#btn-save-walls", {
    content: "Confirm Walls",
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
  tippy("#btn-save", {
    content: "Save your town to file",
    arrow: true,
    placement: "bottom",
    theme: "light",
  })
}
