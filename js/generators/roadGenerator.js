const ROAD_COLORS = ["#505557", "#404547", "#4d5254", "#535b5e", "#545657"]

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
  grid = []
  miners = []
  buildings = []

  btn_draw_roads.addClass("click_me")

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

function changeRoadAddSize(event) {
  if (event.deltaY < 0) {
    road_add_size = clamp(road_add_size + 1, 0, 2)
  } else {
    road_add_size = clamp(road_add_size - 1, 0, 2)
  }
}

function drawRoad(t_mouseX, t_mouseY) {
  btn_generate_buildings.removeAttribute("disabled", "")
  btn_generate_buildings.addClass("click_me")

  let grid_x = Math.floor(t_mouseX / cell_size)
  let grid_y = Math.floor(t_mouseY / cell_size)

  let cells_to_update = []
  cells_to_update.push(grid[indexFromXY(grid_x, grid_y)])
  if (road_add_size >= 1) {
    cells_to_update.push(grid[indexFromXY(grid_x - 1, grid_y - 1)])
    cells_to_update.push(grid[indexFromXY(grid_x, grid_y - 1)])
    cells_to_update.push(grid[indexFromXY(grid_x + 1, grid_y - 1)])
    cells_to_update.push(grid[indexFromXY(grid_x + 1, grid_y)])
    cells_to_update.push(grid[indexFromXY(grid_x + 1, grid_y + 1)])
    cells_to_update.push(grid[indexFromXY(grid_x, grid_y + 1)])
    cells_to_update.push(grid[indexFromXY(grid_x - 1, grid_y + 1)])
    cells_to_update.push(grid[indexFromXY(grid_x - 1, grid_y)])
  }
  if (road_add_size == 2) {
    cells_to_update.push(grid[indexFromXY(grid_x - 2, grid_y - 2)])
    cells_to_update.push(grid[indexFromXY(grid_x - 1, grid_y - 2)])
    cells_to_update.push(grid[indexFromXY(grid_x, grid_y - 2)])
    cells_to_update.push(grid[indexFromXY(grid_x + 1, grid_y - 2)])
    cells_to_update.push(grid[indexFromXY(grid_x + 2, grid_y - 2)])
    cells_to_update.push(grid[indexFromXY(grid_x + 2, grid_y - 1)])
    cells_to_update.push(grid[indexFromXY(grid_x + 2, grid_y)])
    cells_to_update.push(grid[indexFromXY(grid_x + 2, grid_y + 1)])
    cells_to_update.push(grid[indexFromXY(grid_x + 2, grid_y + 2)])
    cells_to_update.push(grid[indexFromXY(grid_x + 1, grid_y + 2)])
    cells_to_update.push(grid[indexFromXY(grid_x, grid_y + 2)])
    cells_to_update.push(grid[indexFromXY(grid_x - 1, grid_y + 2)])
    cells_to_update.push(grid[indexFromXY(grid_x - 2, grid_y + 2)])
    cells_to_update.push(grid[indexFromXY(grid_x - 2, grid_y + 1)])
    cells_to_update.push(grid[indexFromXY(grid_x - 2, grid_y)])
    cells_to_update.push(grid[indexFromXY(grid_x - 2, grid_y - 1)])
  }
  for (let cell of cells_to_update) {
    if (keyIsDown(SHIFT)) {
      cell.type = "dirt"
    } else {
      cell.type = "road"
      cell.color = ROAD_COLORS[Math.floor(Math.random() * ROAD_COLORS.length)]
    }
  }
}
