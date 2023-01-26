function setup() {
  textAlign(CENTER, CENTER)
  createCanvas(windowWidth, windowHeight)

  cell_size = 8
  grid_offset = (cell_size * grid_width - width) / 2

  createUiElements()
  noLoop()
}

let debug = ""

function draw() {
  if (windowWidth < 1000) {
    background(color_dark)
    return
  }
  rectMode(CORNER)

  noStroke()
  background(color_parchment) // Dirt Colour

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
  fill(color_dark)
  rect(0, 0, windowWidth, 100)

  // DEBUG TEXT
  //   textSize(32)
  //   fill(255)
  //   text(debug, 50, 150)
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
  cuteAlert({
    type: "question",
    title: "Are you sure?",
    message:
      "Doing this will remove your entire city. Be sure to save before committing to this!",
    confirmText: "Go!",
    cancelText: "Cancel",
  }).then((e) => {
    if (e == "confirm") {
      generateCity()
    } else {
      // nothing
    }
  })
}

function generateCity() {
  btn_draw_roads.removeAttribute("disabled", "")
  btn_generate_city.removeClass("click_me")
  btn_generate_buildings.removeAttribute("disabled", "")
  btn_confirm_city.attribute("disabled", "")

  btn_draw_roads.show()
  btn_generate_buildings.show()
  btn_confirm_city.show()
  btn_detail_tray.hide()

  town_name.value(GenerateTownName())
  grid_width = size_slider.value()
  grid_height = grid_width
  min_road_x = grid_width
  min_road_y = grid_height

  generateRoads()
}

function confirmCity() {
  cleanGrid()
  current_status = "city_finished"

  btn_draw_roads.hide()
  btn_generate_buildings.hide()
  btn_confirm_city.hide()
  btn_detail_tray.show()

  btn_draw_roads.removeClass("click_me")
  btn_generate_buildings.removeClass("click_me")
  btn_confirm_city.removeClass("click_me")
  btn_generate_city.removeClass("click_me")
}

function createUiElements() {
  header_container = createElement("div")
  header_container.addClass("header_container")
  header_container.position(0, 0)

  left_items = createElement("div")
  left_items.addClass("side_items")

  new_city_container = createElement("div")
  new_city_container.addClass("new_city_button")
  btn_generate_city = createButton("🆕")
  btn_generate_city.mousePressed(newCity)
  btn_generate_city.addClass("click_me")

  size_slider = createSlider(100, 350, 150, 10)
  size_slider.style("width", "95px")
  size_slider.addClass("size_slider")

  new_city_container.child(btn_generate_city)
  new_city_container.child(size_slider)

  btn_draw_roads = createButton("🚧")
  btn_draw_roads.mousePressed(() => {
    current_status = "draw_roads"
    btn_draw_roads.removeClass("click_me")
  })

  btn_generate_buildings = createButton("🏠")
  btn_generate_buildings.mousePressed(generateBuildings)

  btn_confirm_city = createButton("✅")
  btn_confirm_city.mousePressed(confirmCity)
  btn_confirm_city.attribute("disabled", "")

  btn_detail_tray = createButton("📜")
  btn_detail_tray.mousePressed(() => (detail_tray_open = !detail_tray_open))
  btn_detail_tray.hide()

  left_items.child(new_city_container)
  left_items.child(btn_draw_roads)
  left_items.child(btn_generate_buildings)
  left_items.child(btn_confirm_city)
  left_items.child(btn_detail_tray)

  town_name = createInput("")
  town_name.addClass("townNameInput")
  town_name.value("Generate your town...")

  right_items = createElement("div")
  right_items.addClass("side_items")

  btn_save = createButton("💾")
  btn_save.mousePressed(saveToJson)

  btn_load = createFileInput(loadFromJson)
  label_load = createElement("label", "📂")
  label_load.child(btn_load)

  right_items.child(btn_save)
  right_items.child(label_load)

  header_container.child(left_items)
  header_container.child(town_name)
  header_container.child(right_items)

  btn_draw_roads.attribute("disabled", "")
  btn_generate_buildings.attribute("disabled", "")
}
