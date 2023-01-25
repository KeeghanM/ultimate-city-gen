function setup() {
  textAlign(CENTER, CENTER)
  createCanvas(windowWidth, windowHeight)
  scale(0.5)

  cell_size = 8
  grid_offset = (cell_size * grid_width - width) / 2

  createUiElements()
  setUiPositions()
}

function draw() {
  rectMode(CORNER)

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

  rectMode(CENTER)
  if (current_status == "draw_roads") {
    let t_mouseX = (mouseX - transformX) / currentScale
    let t_mouseY = (mouseY - transformY) / currentScale

    fill("rgba(255,255,255, 0.25)") // ROAD GREY
    if (keyIsDown(SHIFT)) fill("rgba(255, 145, 0, 0.25)") // DIRT BROWN

    rect(
      Math.floor(t_mouseX / cell_size) * cell_size + cell_size / 2,
      Math.floor(t_mouseY / cell_size) * cell_size + cell_size / 2,
      cell_size + road_add_size * 2 * cell_size
    )
  }
  pop()

  // DRAW UI ON TOP
  fill("#0B0B45")
  rect(0, 0, windowWidth, 100)
}

function registeredClick(mouse_button) {
  let t_mouseX = (mouseX - transformX) / currentScale
  let t_mouseY = (mouseY - transformY) / currentScale

  if (current_status == "draw_roads") {
    drawRoad(t_mouseX, t_mouseY)
  } else {
    selected_building = undefined

    for (let building of buildings) {
      building.selected = false
      if (pointInPolygon(t_mouseX, t_mouseY, building.points)) {
        // building.selected = true
        selected_building = building
      }
    }
  }
}

function cleanGrid() {
  grid = grid.filter((cell) => cell.type !== "dirt")
}

function newCity() {
  town_name.value(GenerateTownName())
  grid_width = size_slider.value()
  grid_height = grid_width
  min_road_x = grid_width
  min_road_y = grid_height

  generateRoads()
}

function saveToJson() {
  let town = {
    grid,
    buildings,
    name: town_name.value(),
  }

  download(JSON.stringify(town), town_name.value() + ".json", "text/plain")
}

function loadFromJson(file) {
  if (file.subtype === "json") {
    let loaded_town = file.data
    if (loaded_town.buildings && loaded_town.grid && loaded_town.name) {
      grid = loaded_town.grid
      town_name.value(loaded_town.name)
      buildings = []

      // Need to reconstruct the building objects to get access to their funcitons
      for (let loaded_building of loaded_town.buildings) {
        let new_building = new Building()
        new_building.type = loaded_building.type
        new_building.points = loaded_building.points
        new_building.roof_lines = loaded_building.roof_lines
        new_building.roof_points = loaded_building.roof_points
        new_building.color = loaded_building.color
        buildings.push(new_building)
      }
    }
  } else {
    console.log("Wrong type")
  }
}

function createUiElements() {
  btn_generate_roads = createButton("🆕")
  btn_generate_roads.mousePressed(newCity)

  btn_draw_roads = createButton("🚧")
  btn_draw_roads.mousePressed(() => (current_status = "draw_roads"))

  btn_generate_buildings = createButton("🏠")
  btn_generate_buildings.mousePressed(generateBuildings)

  btn_save = createButton("💾")
  btn_save.mousePressed(saveToJson)

  size_slider = createSlider(100, 350, 150, 10)
  size_slider.style("width", "100px")

  town_name = createInput("")
  town_name.addClass("townNameInput")

  btn_load = createFileInput(loadFromJson)
  label_load = createElement("label", "📂")
  label_load.child(btn_load)
}

function setUiPositions() {
  // Left side
  btn_generate_roads.position(0, 0)
  size_slider.position(0, 80)
  btn_draw_roads.position(100, 0)
  btn_generate_buildings.position(200, 0)

  // Middle
  town_name.position(windowWidth / 2 - 100, 0)

  // Right side
  label_load.position(windowWidth - 100, 0)
  //   label_load
  btn_save.position(windowWidth - 200, 0)
}
