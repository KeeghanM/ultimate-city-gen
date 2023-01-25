function setup() {
  textAlign(CENTER, CENTER)
  createCanvas(windowWidth, windowHeight)
  scale(0.5)

  cell_size = 8
  grid_offset = (cell_size * grid_width - width) / 2

  generate_button = createButton("Generate Town")
  generate_button.mousePressed(runGenerator)
  generate_button.style("width", "120px")

  save_button = createButton("Save Town")
  save_button.mousePressed(saveToJson)
  save_button.style("width", "120px")

  size_slider = createSlider(100, 350, 150, 10)
  size_slider.style("width", "80px")

  town_name = createInput("")
  town_name.addClass("townNameInput")
  setUiPositions()
}

function draw() {
  noStroke()
  background(87, 67, 50) // Dirt Colour

  push()
  translate(transformX, transformY)
  scale(currentScale)

  for (let cell of grid) {
    if (cell.type == "road") {
      fill(cell.color)
      rect(cell.x * cell_size, cell.y * cell_size, cell_size)
    }
  }

  for (let building of buildings) {
    building.draw()
  }
  pop()

  // DRAW UI ON TOP
  fill("#0B0B45")
  rect(0, 0, windowWidth, 100)
}

function registeredClick(mouse_button) {
  let t_mouseX = (mouseX - transformX) / currentScale
  let t_mouseY = (mouseY - transformY) / currentScale

  selected_building = undefined

  for (let building of buildings) {
    building.selected = false
    if (pointInPolygon(t_mouseX, t_mouseY, building.points)) {
      // building.selected = true
      selected_building = building
    }
  }
}

function cleanGrid() {
  grid = grid.filter((cell) => cell.type !== "dirt")
}

function runGenerator() {
  town_name.value(GenerateTownName())
  grid_width = size_slider.value()
  grid_height = grid_width
  min_road_x = grid_width
  min_road_y = grid_height

  grid = []
  buildings = []
  miners = []

  // Create four miners in the cardinal directions
  miners.push({ x: grid_width / 2, y: grid_height / 2, direction: 0 })
  miners.push({ x: grid_width / 2, y: grid_height / 2, direction: 1 })
  miners.push({ x: grid_width / 2, y: grid_height / 2, direction: 2 })
  miners.push({ x: grid_width / 2, y: grid_height / 2, direction: 3 })

  // Fill the grid with dirt initially
  for (let x = 0; x < grid_width; x++) {
    for (let y = 0; y < grid_height; y++) {
      grid.push({ x, y, type: "dirt" })
    }
  }

  generateRoads()
  generateBuildings()

  cleanGrid()
}

function saveToJson() {
  let town = {
    grid,
    buildings,
  }

  download(JSON.stringify(town), "TownName.json", "text/plain")
}

function setUiPositions() {
  town_name.position(windowWidth / 2 - 100, 0)
  size_slider.position(130, 5)
  generate_button.position(5, 5)
  save_button.position(5, 30)
}
