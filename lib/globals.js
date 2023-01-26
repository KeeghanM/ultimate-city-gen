// GENERATOR VARIABLES
let grid_width,
  grid_height,
  cell_size,
  building_check_x,
  building_check_y,
  min_road_x,
  min_road_y,
  selected_building,
  current_status

let road_add_size = 0
let grid = []
let buildings = []
let miners = []
let generation_step = "roads"

// UI Elements
let btn_generate_city,
  btn_draw_roads,
  btn_generate_buildings,
  btn_generate_people,
  btn_save,
  btn_load,
  label_load,
  size_slider,
  town_name

// UI COLOURS
let color_dark = "hsl(221,28%,20%)"
let color_medium = "hsl(219,27%,25%)"
let color_light = "hsl(219,10%,75%)"
let color_accent_light = "hsl(21,58%,38%)"
let color_accent_dark = "hsl(21,59%,26%)"
let color_success = "hsl(172,58%,38%)"
let color_error = "hsl(0,58%,38%)"
let color_parchment = "hsl(44,43%,78%)"
let root = document.querySelector(":root")
root.style.setProperty("--color_dark", color_dark)
root.style.setProperty("--color_medium", color_medium)
root.style.setProperty("--color_light", color_light)
root.style.setProperty("--color_accent_light", color_accent_light)
root.style.setProperty("--color_accent_dark", color_accent_dark)
root.style.setProperty("--color_success", color_success)
root.style.setProperty("--color_error", color_error)
root.style.setProperty("--color_parchment", color_parchment)
