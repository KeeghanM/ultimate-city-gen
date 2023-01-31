const BUILDING_CHANCE = 50
const BUSINESS_RATIO = 20 // X/100, the remainder will be homes
const GROW_CHANCE = 15
const TAVERN_CHANCE = 5
const MAX_TAVERNS = Math.max(Math.floor(MAX_MINED / 150), 1)
let tavern_count

function generateBuildings() {
  tavern_count = 0
  buildings = []
  building_check_x = min_road_x
  building_check_y = min_road_y

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

      let building = new Building(cell)
      building.type = type
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
        grid[indexFromXY(building_cell.x, building_cell.y)].type = "building"
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

      // If this is a business, we need to set what type of business.
      // Add 1 person per building, as this might change the name of the business.
      // Houses will be populated later.
      if (building.type == "business") {
        let business_type = getBuildingType()
        building.types_list = business_type.types
        building.titles = business_type.job_titles

        let first_employee = new Person({
          job: building.titles[
            Math.floor(Math.random() * building.titles.length)
          ],
        })

        let business_name = ""
        // Decide if the first employee's name will be used
        // in the store name - or if a random one. 50/50 chance
        let random = Math.random() * 100
        if (random < 50) {
          business_name += first_employee.first_name + "'s "
        } else if (random < 95) {
          // Random name. TODO: Based the ratio's off of race spread in city settings
          // 5% Chance for no name in front
          let random_race = Math.random() * 100
          let name =
            random_race < 33
              ? GenerateHumanName()
              : random_race < 66
              ? GenerateElfName()
              : GenerateDwarfName()
          business_name += name.split(" ")[0] + "'s "
        }

        business_name +=
          business_type.name_options[
            Math.floor(Math.random() * business_type.name_options.length)
          ]

        building.business_name = business_name

        building.employees = []
        building.employees.push(first_employee)

        first_employee.place_of_employment = building
        inhabitants.push(first_employee)
      }

      // Taverns have specific logic
      if (building.type == "tavern") {
      }
      buildings.push(building)
    }
  }

  btn_draw_roads.attribute("disabled", "")
  btn_confirm_city.removeAttribute("disabled", "")
  btn_generate_buildings.removeClass("click_me")
  btn_draw_roads.removeClass("click_me") // Just in case

  current_status = "city_finished"
}
