// IMPORTS AND CONSTS
const { ipcRenderer } = require("electron")
const { p5 } = require("p5")
const { Polygon } = require("./Towns/voronoi/polygon")
const { Town } = require("./Towns/town")
const { Site } = require("./Towns/voronoi/site")
const { District } = require("./Towns/district")
const {
  removeClosest,
  pointInPolygon,
  setMode,
  toggleDetailSection,
  clockwiseOrder,
} = require("./Towns/assets/helpers")

const COLORS = {
  dark: "#333",
  light: "#999",
  primary: "#F4A259",
  accent: "#5B8E7D",
  danger: "#BC4B51",
  success: "#8CB369",
}
const UI_BAR_HEIGHT = 50
const DETAIL_WIDTH = 400
const BORDER_WIDTH = 5

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
let btnList = []
let labelFont
let detailPane

// General Variables
let mode = "hand"
let drawWalls = true
let drawLabels = true
let wallSites = []
let wallPoly
let town = new Town({})

// Currently Selected Items
let currentDistrict
let currentBuilding

function preload() {
  labelFont = loadFont("./Towns/assets/LinLibertine_RB.ttf")
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  textAlign(CENTER, CENTER)

  createFunctionButtons()
  createDetailPane()

  setMode("hand")
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

  if (mode == "details") {
    fill(COLORS.accent)
    rect(
      windowWidth - DETAIL_WIDTH - BORDER_WIDTH,
      UI_BAR_HEIGHT,
      windowWidth - DETAIL_WIDTH,
      windowHeight - UI_BAR_HEIGHT
    )

    fill(COLORS.dark)
    rect(
      windowWidth - DETAIL_WIDTH,
      UI_BAR_HEIGHT,
      DETAIL_WIDTH,
      windowHeight - UI_BAR_HEIGHT
    )

    fill(COLORS.primary)
    noStroke()
    textSize(50)
    text("Details", windowWidth - DETAIL_WIDTH / 2, 90)
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
      removeClosest(t_mouseX, t_mouseY, wallSites, 60)
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
      // removeClosest(t_mouseX, t_mouseY, districts, 15)
      // TODO: Remove districts?
    }
  }

  if (mode == "block") {
    if (mouseBtn === LEFT) {
      let allClicked = []
      town.district.findAllClicked(t_mouseX, t_mouseY, allClicked)
      if (allClicked.length > 1) {
        let clickedDistrict = allClicked[1]
        let site = new Site(t_mouseX, t_mouseY)
        let newDistrict = new District({ site })
        clickedDistrict.children.push(newDistrict)
        clickedDistrict.calcV(5)
      }
    }
  }

  if (mode == "details") {
    if (
      mouseBtn === LEFT &&
      mouseX < windowWidth - DETAIL_WIDTH - BORDER_WIDTH
    ) {
      let allClicked = []
      town.district.findAllClicked(t_mouseX, t_mouseY, allClicked)
      if (allClicked.length > 1) {
        currentDistrict = allClicked[1]
        districtNameInput.value(currentDistrict.name)
      }
      if (allClicked.length > 2) {
        currentBuilding = allClicked[3]
      }
    }
  }
}

// PAN AND ZOOM LOGIC
function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  detailPane?.position(windowWidth - DETAIL_WIDTH, UI_BAR_HEIGHT + 100)
}

function mousePressed() {
  mousePressedX = mouseX
  mousePressedY = mouseY
}

function mouseDragged() {
  if (
    dist(mousePressedX, mousePressedY, mouseX, mouseY) >
      mouseDragDetectionThreshold &&
    (!mode == "details" || mouseX < windowWidth - DETAIL_WIDTH - BORDER_WIDTH)
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
    btn_showLabels.removeAttribute("disabled")
    btn_showWalls.removeAttribute("disabled")
    btn_details.removeAttribute("disabled")
    btn_save.removeAttribute("disabled")
  }

  if (town?.district?.children.length > 0) {
    btn_addBlock.removeAttribute("disabled")
  }

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
  btn_hand = addButton(
    "✋",
    { x: 0, y: 0 },
    "hand",
    false,
    "Hand (navigation) mode",
    () => setMode("hand")
  )
  btn_addWall = addButton(
    "🧱",
    { x: 50, y: 0 },
    "wall",
    false,
    "Add Walls (left click to add, right click to remove)",
    () => setMode("wall")
  )
  btn_saveWalls = addButton(
    "✔️",
    { x: 100, y: 0 },
    "save-walls",
    true,
    "Confirm Walls",
    saveWalls
  )
  btn_addDistrict = addButton(
    "🚧",
    { x: 50, y: 0 },
    "district",
    true,
    "Add Districts (left click to add, right click to remove)",
    () => setMode("district")
  )
  btn_addBlock = addButton(
    "🔳",
    { x: 100, y: 0 },
    "block",
    true,
    "Add Blocks (left click to add, right click to remove)",
    () => setMode("block")
  )
  btn_addBuilding = addButton(
    "🏛️",
    { x: 150, y: 0 },
    "building",
    true,
    "Add Buildings (left click to add, right click to remove)",
    () => setMode("building")
  )
  btn_showLabels = addButton(
    "🏷️",
    { x: 250, y: 0 },
    "labels",
    true,
    "Show or Hide district labels on the map",
    () => (drawLabels = !drawLabels)
  )
  btn_showWalls = addButton(
    "👁️",
    { x: 300, y: 0 },
    "draw-walls",
    true,
    "Show or Hide the town walls",
    () => (drawWalls = !drawWalls)
  )
  btn_details = addButton(
    "📜",
    { x: 350, y: 0 },
    "details",
    true,
    "View & edit details for town/districts/buildings",
    () => setMode("details")
  )
  btn_save = addButton(
    "💾",
    { x: 450, y: 0 },
    "save",
    true,
    "View & edit details for town/districts/buildings",
    saveFile
  )
}

function addButton(text, pos, id, disabled, tooltip, onClickFnc, size) {
  let btn = createButton(text)
  btn.position(pos.x, pos.y)
  if (size) {
    btn.size(size.w, size.h)
  } else {
    btn.size(UI_BAR_HEIGHT, UI_BAR_HEIGHT)
  }

  btn.id("btn-" + id)

  if (disabled) btn.attribute("disabled", "")

  if (tooltip) {
    tippy("#btn-" + id, {
      content: tooltip,
      arrow: true,
      placement: "bottom",
      theme: "light",
    })
  }

  btn.mousePressed(onClickFnc)

  btnList.push(btn)

  return btn
}

// DETAIL PANE
let townHeader,
  townSection,
  townNameLabel,
  townNameInput,
  townDescriptionLabel,
  townDescription,
  districtHeader,
  districtNameLabel,
  districtNameInput,
  buildingHeader,
  buildingSection

function createDetailPane() {
  detailPane = createDiv().id("detail-pane")
  detailPane.position(windowWidth - DETAIL_WIDTH, UI_BAR_HEIGHT + 100)

  townHeader = createElement("h1", "Town 🔽")
    .parent(detailPane)
    .mousePressed(() => toggleDetailSection(townSection))
  townSection = createDiv().parent(detailPane).class("detail-section").hide()
  townNameLabel = createElement("label", "Town Name:").parent(townSection)
  townNameInput = createInput(town.name, "text")
    .parent(townSection)
    .input(updateTown)
  townDescriptionLabel = createElement("label", "Town Description:").parent(
    townSection
  )
  townDescription = createElement("textarea").parent(townSection)

  districtHeader = createElement("h1", "District 🔽")
    .parent(detailPane)
    .mousePressed(() => toggleDetailSection(districtSection))
  districtSection = createDiv()
    .parent(detailPane)
    .class("detail-section")
    .hide()

  districtNameLabel = createElement("label", "District Name:").parent(
    districtSection
  )
  districtNameInput = createInput(currentDistrict?.name, "text")
    .parent(districtSection)
    .input(() => updateDistrict(currentDistrict))

  buildingHeader = createElement("h1", "Building 🔽")
    .parent(detailPane)
    .mousePressed(() => toggleDetailSection(buildingSection))
  buildingSection = createDiv()
    .parent(detailPane)
    .class("detail-section")
    .hide()
}

function updateDistrict(district) {
  currentDistrict.name = districtNameInput.value()
}
function updateTown() {
  town.name = townNameInput.value()
}
