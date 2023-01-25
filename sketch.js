// ZOOM AND PAN
const zoomSensitivity = 0.1
let currentScale = 1
let transformX = 0
let transformY = 0
let isMouseDragged = false
let mousePressedX = null
let mousePressedY = null
const mouseDragDetectionThreshold = 10
const UI_BAR_HEIGHT = 50
const DETAIL_WIDTH = 400
const BORDER_WIDTH = 5
let mode = "hand"

// GENERATOR VARIABLES
let grid_width,
  grid_height,
  cell_size,
  generate_button,
  size_slider,
  building_check_x,
  building_check_y,
  save_button
let grid_offset = 0
let grid = []
let buildings = []
let miners = []
let generation_step = "roads"
let min_road_x
let min_road_y

const ROOF_COLORS = [
  "#634902",
  "#632805",
  "#5e2c0e",
  "#57321d",
  "#4a220c",
  "#451c1a",
  "#8f342f",
  "#695b3d",
]
const ROAD_COLORS = ["#505557", "#404547", "#4d5254", "#535b5e", "#545657"]
let selected_building

function setup() {
  createCanvas(windowWidth, windowHeight)
  scale(0.5)

  cell_size = 8
  grid_offset = (cell_size * grid_width - width) / 2

  generate_button = createButton("Generate Town")
  generate_button.position(5, 5)
  generate_button.mousePressed(runGenerator)
  generate_button.style("width", "120px")

  save_button = createButton("Save Town")
  save_button.position(5, 30)
  save_button.mousePressed(saveToJson)
  save_button.style("width", "120px")

  size_slider = createSlider(100, 350, 150, 10)
  size_slider.position(130, 5)
  size_slider.style("width", "80px")
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
    fill(building == selected_building ? "#0096FF" : building.color)

    stroke(0)
    strokeWeight(0.5)

    beginShape()
    for (let point of building.points) {
      vertex(point.x, point.y)
    }
    endShape(CLOSE)
    for (let roof_line of building.roof_lines) {
      line(
        roof_line.start_x,
        roof_line.start_y,
        roof_line.end_x,
        roof_line.end_y
      )
    }
    if (building.roof_points.length > 1) {
      for (let i = 0; i < building.roof_points.length - 1; i++) {
        let point = building.roof_points[i]
        let next_point = building.roof_points[i + 1]
        line(point.x, point.y, next_point.x, next_point.y)
      }
    }
  }

  pop()
}

const SPAWN_CHANCE = 20
const DEATH_CHANCE = 5
const TURN_CHANCE = 10
const MIN_MINED = 100
let MAX_MINED
const MAX_MINERS = 10
let mined_cell_count

function generateRoads() {
  MAX_MINED = (grid_width * grid_height) / 32
  mined_cell_count = 0
  while (miners.length > 0 && mined_cell_count < MAX_MINED) {
    for (let miner of miners) {
      if (mined_cell_count >= MAX_MINED) {
        building_check_x = min_road_x
        building_check_y = min_road_y
        return
      }

      let x_to_check = clamp(miner.x, 0, grid_width - 1)
      let y_to_check = clamp(miner.y, 0, grid_height - 1)

      if (grid[indexFromXY(x_to_check, y_to_check)].type == "dirt") {
        grid[indexFromXY(x_to_check, y_to_check)].type = "road"
        grid[indexFromXY(x_to_check, y_to_check)].color =
          ROAD_COLORS[Math.floor(Math.random() * ROAD_COLORS.length)]
        mined_cell_count++

        if (x_to_check < min_road_x) min_road_x = x_to_check
        if (y_to_check < min_road_y) min_road_y = y_to_check
      }

      if (
        (Math.random() * 100 < DEATH_CHANCE && mined_cell_count > MIN_MINED) ||
        miner.x == 0 ||
        miner.y == 0 ||
        miner.x == grid_width - 1 ||
        miner.y == grid_height - 1
      ) {
        miners = miners.filter((miner_to_check) => miner_to_check != miner)
        continue // No point processing the rest of the cell if it's dead now!
      }

      if (Math.random() * 100 < SPAWN_CHANCE && miners.length < MAX_MINERS)
        miners.push({ x: miner.x, y: miner.y })

      if (Math.random() * 100 < TURN_CHANCE) {
        miner.dir = Math.floor(Math.random() * (3 - 0 + 1)) + 0
      }

      if (miner.dir == 0) clamp(miner.y--, 0, grid_height)
      if (miner.dir == 1) clamp(miner.x++, 0, grid_width)
      if (miner.dir == 2) clamp(miner.y++, 0, grid_height)
      if (miner.dir == 3) clamp(miner.x--, 0, grid_width)
    }
  }
}

const BUILDING_CHANCE = 50
const BUSINESS_RATIO = 20 // X/100, the remainder will be homes
const GROW_CHANCE = 15
const TAVERN_CHANCE = 5
const MAX_TAVERNS = Math.max(Math.floor(MAX_MINED / 150), 1)
let tavern_count

function generateBuildings() {
  tavern_count = 0
  buildings = []
  while (building_check_x < grid_width && building_check_y < grid_height) {
    let cell = grid[indexFromXY(building_check_x, building_check_y)]

    building_check_x++
    if (building_check_x == grid_width) {
      building_check_x = min_road_x
      building_check_y++
    }

    if (cell.type != "dirt") continue // Only dirt tiles can spawn a building
    if (Math.random() * 100 > BUILDING_CHANCE) {
      //Before doing expensive lookups, decide if we even want to make a building here or not
      continue
    }

    // Check the cardinal neighbours - if at least one is a road.. then make a building
    if (
      grid[indexFromXY(clamp(cell.x + 1, 0, grid_width - 1), cell.y)].type ==
        "road" ||
      grid[indexFromXY(cell.x, clamp(cell.y + 1, 0, grid_height - 1))].type ==
        "road" ||
      grid[indexFromXY(clamp(cell.x - 1, 0, grid_width - 1), cell.y)].type ==
        "road" ||
      grid[indexFromXY(cell.x, clamp(cell.y - 1, 0, grid_height - 1))].type ==
        "road"
    ) {
      let type
      if (Math.random() * 100 < TAVERN_CHANCE && tavern_count < MAX_TAVERNS) {
        type = "tavern"
        tavern_count++
      } else {
        type = Math.random() * 100 < BUSINESS_RATIO ? "business" : "house"
      }

      let building = {
        cells: [{ x: cell.x, y: cell.y }],
        type,
        points: [],
        corners: [],
        roof_lines: [],
        roof_points: [],
        color: ROOF_COLORS[Math.floor(Math.random() * ROOF_COLORS.length)],
      }
      // Some buildings want to be larger - there is a % chance to grow in each cardinal direction
      // Taverns almost alway grow
      let grow_modifier = 0
      if (building.type == "tavern") grow_modifier = 50

      if (
        grid[indexFromXY(clamp(cell.x + 1, 0, grid_width - 1), cell.y)].type ==
          "dirt" &&
        Math.random() * 100 < GROW_CHANCE + grow_modifier
      ) {
        building.cells.push({
          x: clamp(cell.x + 1, 0, grid_width - 1),
          y: cell.y,
        })
      }
      if (
        grid[indexFromXY(cell.x, clamp(cell.y + 1, 0, grid_height - 1))].type ==
          "dirt" &&
        Math.random() * 100 < GROW_CHANCE + grow_modifier
      ) {
        building.cells.push({
          x: cell.x,
          y: clamp(cell.y + 1, 0, grid_height - 1),
        })
      }
      if (
        grid[indexFromXY(clamp(cell.x - 1, 0, grid_width - 1), cell.y)].type ==
          "dirt" &&
        Math.random() * 100 < GROW_CHANCE + grow_modifier
      ) {
        building.cells.push({
          x: clamp(cell.x - 1, 0, grid_width - 1),
          y: cell.y,
        })
      }
      if (
        grid[indexFromXY(cell.x, clamp(cell.y - 1, 0, grid_height - 1))].type ==
          "dirt" &&
        Math.random() * 100 < GROW_CHANCE + grow_modifier
      ) {
        building.cells.push({
          x: cell.x,
          y: clamp(cell.y - 1, 0, grid_height - 1),
        })
      }

      for (let building_cell of building.cells) {
        building.points.push({
          x: building_cell.x * cell_size,
          y: building_cell.y * cell_size,
        })
        building.points.push({
          x: building_cell.x * cell_size + cell_size,
          y: building_cell.y * cell_size,
        })
        building.points.push({
          x: building_cell.x * cell_size + cell_size,
          y: building_cell.y * cell_size + cell_size,
        })
        building.points.push({
          x: building_cell.x * cell_size,
          y: building_cell.y * cell_size + cell_size,
        })
      }

      building.points = sortPointsClockwise(building.points)

      // Find the corners
      for (let i = 0; i < building.points.length; i++) {
        let point = building.points[i]
        let point_one_ahead =
          building.points[
            i + 1 >= building.points.length
              ? i + 1 - building.points.length
              : i + 1
          ]
        let point_one_behind =
          building.points[i - 1 < 0 ? i - 1 + building.points.length : i - 1]

        if (
          point_one_behind.x != point_one_ahead.x &&
          point_one_behind.y != point_one_ahead.y
        ) {
          // WE ARE A CORNER!
          building.corners.push(point)

          line_end = { x: point.x, y: point.y }

          // Top left
          if (
            point_one_ahead.x > point.x &&
            point_one_ahead.y == point.y &&
            point_one_behind.x == point.x &&
            point_one_behind.y > point.y
          ) {
            line_end.x += cell_size / 2
            line_end.y += cell_size / 2
          }
          // Top right
          else if (
            point_one_ahead.x == point.x &&
            point_one_ahead.y > point.y &&
            point_one_behind.x < point.x &&
            point_one_behind.y == point.y
          ) {
            line_end.x -= cell_size / 2
            line_end.y += cell_size / 2
          }
          // Bottom right
          else if (
            point_one_ahead.x < point.x &&
            point_one_ahead.y == point.y &&
            point_one_behind.x == point.x &&
            point_one_behind.y < point.y
          ) {
            line_end.x -= cell_size / 2
            line_end.y -= cell_size / 2
          }
          // Bottom left
          else if (
            point_one_ahead.x == point.x &&
            point_one_ahead.y < point.y &&
            point_one_behind.x > point.x &&
            point_one_behind.y == point.y
          ) {
            line_end.x += cell_size / 2
            line_end.y -= cell_size / 2
          }
          // Inner right up
          else if (
            point_one_ahead.x == point.x &&
            point_one_ahead.y > point.y &&
            point_one_behind.x > point.x &&
            point_one_behind.y == point.y
          ) {
            line_end.x -= cell_size / 2
            line_end.y -= cell_size / 2
          }
          // Inner right down
          else if (
            point_one_ahead.x > point.x &&
            point_one_ahead.y == point.y &&
            point_one_behind.x == point.x &&
            point_one_behind.y < point.y
          ) {
            line_end.x -= cell_size / 2
            line_end.y += cell_size / 2
          }
          // Inner left down
          else if (
            point_one_ahead.x == point.x &&
            point_one_ahead.y < point.y &&
            point_one_behind.x < point.x &&
            point_one_behind.y == point.y
          ) {
            line_end.x += cell_size / 2
            line_end.y += cell_size / 2
          }
          // Inner left up
          else if (
            point_one_ahead.x < point.x &&
            point_one_ahead.y == point.y &&
            point_one_behind.x == point.x &&
            point_one_behind.y > point.y
          ) {
            line_end.x += cell_size / 2
            line_end.y -= cell_size / 2
          }

          building.roof_lines.push({
            start_x: point.x,
            start_y: point.y,
            end_x: line_end.x,
            end_y: line_end.y,
          })

          building.roof_points.push({
            x: line_end.x,
            y: line_end.y,
          })
        }
      }
      delete building.corners
      delete building.cells

      buildings.push(building)
    }
  }
}

function cleanGrid() {
  grid = grid.filter((cell) => cell.type !== "dirt")
}

function runGenerator() {
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
// HELPERS
function download(content, fileName, contentType) {
  var a = document.createElement("a")
  var file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}
const indexFromXY = (x, y) => grid_width * x + y

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const sortPointsClockwise = (points) => {
  let non_dupe_points = removeDupes(points)

  const center = non_dupe_points.reduce(
    (acc, { x, y }) => {
      acc.x += x / non_dupe_points.length
      acc.y += y / non_dupe_points.length
      return acc
    },
    { x: 0, y: 0 }
  )

  // Add an angle property to each point using tan(angle) = y/x
  const angles = non_dupe_points.map(({ x, y }) => {
    return {
      x,
      y,
      angle: (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI,
    }
  })

  // Sort your points by angle
  const pointsSorted = angles.sort((a, b) => a.angle - b.angle)

  for (let point of pointsSorted) {
    delete point.angle
  }

  return pointsSorted
}
function removeDupes(input_array) {
  let unique_array = []
  input_array.forEach((input_element) => {
    if (
      !unique_array.some(
        (unique_element) =>
          unique_element.x === input_element.x &&
          unique_element.y === input_element.y
      )
    ) {
      unique_array.push(input_element)
    }
  })
  return unique_array
}

function distanceBetween(x1, y1, x2, y2) {
  var a = x1 - x2
  var b = y1 - y2

  return Math.sqrt(a * a + b * b)
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

// PAN AND ZOOM LOGIC
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
