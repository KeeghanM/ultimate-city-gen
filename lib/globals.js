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
let btn_generate_roads,
  btn_draw_roads,
  btn_generate_buildings,
  btn_generate_people,
  btn_save,
  btn_load,
  label_load,
  size_slider,
  town_name
