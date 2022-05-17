// IMPORTS AND CONSTS
const { ipcRenderer } = require("electron")
const { p5 } = require("p5")
const { Polygon } = require("./Towns/voronoi/polygon")
const { Town } = require("./Towns/town")
const { Site } = require("./Towns/voronoi/site")
const { District } = require("./Towns/district")
const { Building } = require("./Towns/building")
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
let districtsSaved = false

// Currently Selected Items
let currentDistrict
let currentBlock
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
    fill(COLORS.dark)
    strokeWeight(2)
    stroke(COLORS.light)
    for (let child of town.district.children) {
      textSize(30)
      let centre =
        child.poly.points.length > 1 ? child.poly.centre() : child.site
      text(child.name, centre.x, centre.y)

      textSize(15)
      for (let block of child.children) {
        let blockCentre =
          block.poly.points.length > 1 ? block.poly.centre() : block.site
        text(block.name, blockCentre.x, blockCentre.y)
      }
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

  if (mode == "building") {
    if (mouseBtn === LEFT) {
      let allClicked = []
      town.district.findAllClicked(t_mouseX, t_mouseY, allClicked)
      if (allClicked.length > 1) {
        let clickedDistrict = allClicked[1]
        let clickedBlock = allClicked[2]

        let address =
          clickedBlock.buildings.length +
          1 +
          " " +
          clickedBlock.name +
          ", " +
          clickedDistrict.name +
          ", " +
          town.name
        let newBuilding = new Building({
          type: "house",
          position: [t_mouseX, t_mouseY],

          address,
        })
        clickedBlock.buildings.push(newBuilding)
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
        currentBlock = allClicked[2]
        blockNameInput.value(currentBlock.name)
      }
      if (allClicked.length > 3) {
        currentBuilding = allClicked[3]
        buildingNameInput.value(currentBuilding.name)
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
  if (wallSites.length > 3 && town.district == undefined) {
    btn_saveWalls.removeAttribute("disabled")
  }

  if (town.district?.children.length > 1 && !districtsSaved) {
    btn_saveDistricts.removeAttribute("disabled")
  }

  if (wallPoly && !districtsSaved) {
    btn_saveWalls.attribute("disabled", "")
    btn_addWall.attribute("disabled", "")
    btn_addDistrict.removeAttribute("disabled")
    btn_showLabels.removeAttribute("disabled")
    btn_showWalls.removeAttribute("disabled")
    btn_details.removeAttribute("disabled")
    btn_save.removeAttribute("disabled")
  }
}

function saveWalls() {
  if (wallSites.length > 3) {
    wallPoly = new Polygon(wallSites)
    town.setDistrict(wallPoly)
    setMode("hand")
  }
}

function saveDistricts() {
  districtsSaved = true
  btn_addBlock.removeAttribute("disabled")
  btn_saveBlocks.removeAttribute("disabled")
  btn_addDistrict.attribute("disabled", "")
  btn_saveDistricts.attribute("disabled", "")
  setMode("hand")
}

function saveBlocks() {
  let valid = true
  for (let district of town.district.children) {
    if (district.children.length < 2) valid = false
  }

  if (valid) {
    for (let district of town.district.children) {
      for (let block of district.children) {
        block.generateBuildings()
      }
    }
    btn_addBuilding.removeAttribute("disabled")
    btn_addBlock.attribute("disabled", "")
    btn_saveBlocks.attribute("disabled", "")
    setMode("building")
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
    "Confirm Walls: Save the current town shape and move onto adding districts. You won't be able to change the general town shape after this.",
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
  btn_saveDistricts = addButton(
    "✔️",
    { x: 100, y: 0 },
    "save-districts",
    true,
    "Confirm Districts: Save the current districts and move onto defining blocks. You will still be able to edit names & types, but will be unable to add or remove any districts.",
    saveDistricts
  )
  btn_addBlock = addButton(
    "🔳",
    { x: 50, y: 0 },
    "block",
    true,
    "Add Blocks (left click to add, right click to remove)",
    () => setMode("block")
  )
  btn_saveBlocks = addButton(
    "✔️",
    { x: 100, y: 0 },
    "save-districts",
    true,
    "Confirm Blocks: Save the current blocks and move onto adding buildings. You will be unable to add or remove any blocks.",
    saveBlocks
  )
  btn_addBuilding = addButton(
    "🏛️",
    { x: 50, y: 0 },
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
  blockHeader,
  blockSection,
  buildingHeader,
  buildingSection

function createDetailPane() {
  detailPane = createDiv().id("detail-pane")
  detailPane.position(windowWidth - DETAIL_WIDTH, UI_BAR_HEIGHT + 100)

  // TOWN
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

  // DISTRICT
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
    .input(updateDistrict)

  // BLOCK
  blockHeader = createElement("h1", "Block 🔽")
    .parent(detailPane)
    .mousePressed(() => toggleDetailSection(blockSection))
  blockSection = createDiv().parent(detailPane).class("detail-section").hide()
  blockNameLabel = createElement("label", "Block Name:").parent(blockSection)
  blockNameInput = createInput(currentBlock?.name, "text")
    .parent(blockSection)
    .input(updateBlock)

  // BUILDING
  buildingHeader = createElement("h1", "Building 🔽")
    .parent(detailPane)
    .mousePressed(() => toggleDetailSection(buildingSection))
  buildingSection = createDiv()
    .parent(detailPane)
    .class("detail-section")
    .hide()
}

function updateDistrict() {
  currentDistrict.name = districtNameInput.value()
}
function updateBlock() {
  currentBlock.name = districtNameInput.value()
}
function updateTown() {
  town.name = townNameInput.value()
}
