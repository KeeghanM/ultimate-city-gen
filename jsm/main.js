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
  btn_confirm_city,
  btn_save,
  btn_load,
  btn_open_city_details,
  label_load,
  size_slider,
  town_name

let panes = []

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
;function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

function download(content, fileName, contentType) {
  var a = document.createElement("a")
  var file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}

function indexFromXY(x, y) {
  return grid_width * x + y
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max)
}

function sortPointsClockwise(points) {
  let non_dupe_points = removeDupes(points)

  const center = non_dupe_points.reduce(
    (acc, { x, y }) => {
      acc.x += x / non_dupe_points.length
      acc.y += y / non_dupe_points.length
      return acc
    },
    { x: 0, y: 0 }
  )
  const angles = non_dupe_points.map(({ x, y }) => {
    return {
      x,
      y,
      angle: (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI,
    }
  })

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
;const zoomSensitivity = 0.1
let currentScale = 1
let transformX = 0
let transformY = 0
let isMouseDragged = false
let mousePressedX = null
let mousePressedY = null
const mouseDragDetectionThreshold = 10
let UI_BAR_HEIGHT = 100
let selected_pane = undefined

function mousePressed() {
  loop()
  mousePressedX = mouseX
  mousePressedY = mouseY

  for (let i = panes.length - 1; i >= 0; i--) {
    let pane = panes[i]
    if (pane.clicked()) {
      pane.moveToTop()
      pane.setOffset(mouseX, mouseY)
      selected_pane = pane
      break
    }
  }
}

function mouseWheel(event) {
  loop()
  if (keyIsDown(CONTROL)) {
    zoomScroll(event)
  } else if (current_status == "draw_roads") {
    changeRoadAddSize(event)
  }
  return false
}

function mouseDragged() {
  if (selected_pane) {
    selected_pane.setPosition(mouseX, mouseY)
    selected_pane.moveToTop()
  } else if (
    dist(mousePressedX, mousePressedY, mouseX, mouseY) >
      mouseDragDetectionThreshold &&
    mouseY > UI_BAR_HEIGHT
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

  selected_pane = undefined
  if (current_status != "draw_roads") {
    noLoop()
  }
}

function zoomScroll(event) {
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
}
;function saveToJson() {
  let town = {
    grid,
    buildings,
    name: town_name.value(),
  }

  download(JSON.stringify(town), town_name.value() + ".json", "text/plain")
}

function loadFromJson(file) {
  if (file.subtype !== "json") return

  let loaded_town = file.data
  if (!loaded_town.buildings || !loaded_town.grid || !loaded_town.name) return

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

  confirmCity()
  redraw()
}
;// Alert box design by Igor Ferrão de Souza: https://www.linkedin.com/in/igor-ferr%C3%A3o-de-souza-4122407b/

const cuteAlert = ({
  url,
  type,
  title,
  message,
  img,
  buttonText = 'OK',
  confirmText = 'OK',
  vibrate = [],
  playSound = null,
  cancelText = 'Cancel',
  closeStyle,
}) => {
  return new Promise(resolve => {
    const existingAlert = document.querySelector('.alert-wrapper');

    if (existingAlert) {
      existingAlert.remove();
    }

    const body = document.querySelector('body');

    const scripts = document.getElementsByTagName('script');

    let src = '';

    for (let script of scripts) {
      if (script.src.includes('cute-alert.js')) {
        src = script.src.substring(0, script.src.lastIndexOf('/'));
      }
    }

    let btnTemplate = `
    <button class="alert-button ${type}-bg ${type}-btn">${buttonText}</button>
    `;

    if (type === 'question') {
      btnTemplate = `
      <div class="question-buttons">
        <button class="confirm-button ${type}-bg ${type}-btn">${confirmText}</button>
        <button class="cancel-button error-bg error-btn">${cancelText}</button>
      </div>
      `;
    }

    if (vibrate.length > 0) {
      navigator.vibrate(vibrate);
    }

    if (playSound !== null) {
      let sound = new Audio(playSound);
      sound.play();
    }

    const template = `
    <div class="alert-wrapper">
      <div class="alert-frame">
        ${
          img === undefined
            ? '<div class="alert-header ' + type + '-bg">'
            : '<div class="alert-header-base">'
        }
          <span class="alert-close ${
            closeStyle === 'circle'
              ? 'alert-close-circle'
              : 'alert-close-default'
          }">X</span>
          ${
            img === undefined
              ? '<img class="alert-img" src="' +
                src +
                "/img/" +
                type +
                ".svg" +
                '" />'
              : '<div class="custom-img-wrapper">' + img + "</div>"
          }
        </div>
        <div class="alert-body">
          <span class="alert-title">${title}</span>
          <span class="alert-message">${message}</span>
          ${btnTemplate}
        </div>
      </div>
    </div>
    `;

    body.insertAdjacentHTML('afterend', template);

    const alertWrapper = document.querySelector('.alert-wrapper');
    const alertFrame = document.querySelector('.alert-frame');
    const alertClose = document.querySelector('.alert-close');

    if (type === 'question') {
      const confirmButton = document.querySelector('.confirm-button');
      const cancelButton = document.querySelector('.cancel-button');

      confirmButton.addEventListener('click', () => {
        alertWrapper.remove();
        resolve('confirm');
      });

      cancelButton.addEventListener('click', () => {
        alertWrapper.remove();
        resolve();
      });
    } else {
      const alertButton = document.querySelector('.alert-button');

      alertButton.addEventListener('click', () => {
        alertWrapper.remove();
        resolve('ok');
      });
    }

    alertClose.addEventListener('click', () => {
      alertWrapper.remove();
      resolve('close');
    });

/*     alertWrapper.addEventListener('click', () => {
      alertWrapper.remove();
      resolve();
    }); */

    alertFrame.addEventListener('click', e => {
      e.stopPropagation();
    });
  });
};

const cuteToast = ({ type, title, message, timer = 5000,  vibrate = [], playSound = null }) => {
  return new Promise(resolve => {
    const body = document.querySelector('body');

    const scripts = document.getElementsByTagName('script');

    let src = '';

    for (let script of scripts) {
      if (script.src.includes('cute-alert.js')) {
        src = script.src.substring(0, script.src.lastIndexOf('/'));
      }
    }

    let templateContainer = document.querySelector('.toast-container');

    if (!templateContainer) {
      body.insertAdjacentHTML(
        'afterend',
        '<div class="toast-container"></div>',
      );
      templateContainer = document.querySelector('.toast-container');
    }

    const toastId = id();

    const templateContent = `
    <div class="toast-content ${type}-bg" id="${toastId}-toast-content">
      <div>
        <div class="toast-frame">
          <div class="toast-body">
            <img class="toast-body-img" src="${src}/img/${type}.svg" />'
            <div class="toast-body-content">
              <span class="toast-title">${title}</span>
              <span class="toast-message">${message}</span>
            </div>
            <div class="toast-close" id="${toastId}-toast-close">X</div>
          </div>
        </div>
        <div class="toast-timer ${type}-timer"  style="animation: timer${timer}ms linear;>
      </div>
    </div>
    `;

    const toasts = document.querySelectorAll('.toast-content');

    if (toasts.length) {
      toasts[0].insertAdjacentHTML('beforebegin', templateContent);
    } else {
      templateContainer.innerHTML = templateContent;
    }

    const toastContent = document.getElementById(`${toastId}-toast-content`);

    if (vibrate.length > 0) {
      navigator.vibrate(vibrate);
    }

    if (playSound !== null) {
      let sound = new Audio(playSound);
      sound.play();
    }

    setTimeout(() => {
      toastContent.remove();
      resolve();
    }, timer);

    const toastClose = document.getElementById(`${toastId}-toast-close`);

    toastClose.addEventListener('click', () => {
      toastContent.remove();
      resolve();
    });
  });
};

const id = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};

if(url){
  var toastTypes = ["success","error","warning","info","question"]
  var src = ["https://svgshare.com/i/jVz.svg","https://svgshare.com/i/jUv.svg","https://svgshare.com/i/jW0.svg","https://svgshare.com/i/jWA.svg","https://svgshare.com/i/jUw.svg"];
  for (var i = 0; i < document.getElementsByClassName("alert-img").length; i++) {
    for (var j = 0; j < toastTypes.length; j++) {
      if (document.getElementsByClassName("alert-img")[i].parentElement.classList.contains(toastTypes[j]+"-bg")) {
        document.getElementsByClassName("alert-img")[i].src = src[j];
      }
    }
  }
}

;const ROOF_COLORS = [
  "#634902",
  "#632805",
  "#5e2c0e",
  "#57321d",
  "#4a220c",
  "#451c1a",
  "#8f342f",
  "#695b3d",
]

class Building {
  constructor(cell) {
    if (cell) this.cells = [{ x: cell.x, y: cell.y }]
    this.type = ""
    this.points = []
    this.corners = []
    this.roof_lines = []
    this.roof_points = []
    this.color = ROOF_COLORS[Math.floor(Math.random() * ROOF_COLORS.length)]
  }

  draw() {
    fill(this == selected_building ? "#0096FF" : this.color)

    stroke(0)
    strokeWeight(0.5)

    beginShape()
    for (let point of this.points) {
      vertex(point.x, point.y)
    }
    endShape(CLOSE)
    for (let roof_line of this.roof_lines) {
      line(
        roof_line.start_x,
        roof_line.start_y,
        roof_line.end_x,
        roof_line.end_y
      )
    }
    if (this.roof_points.length > 1) {
      for (let i = 0; i < this.roof_points.length - 1; i++) {
        let point = this.roof_points[i]
        let next_point = this.roof_points[i + 1]
        line(point.x, point.y, next_point.x, next_point.y)
      }
    }
  }
}
;class Pane {
  constructor(options) {
    this.offset = { x: 0, y: 0 }
    let x = options.x || 0
    let y = options.y || UI_BAR_HEIGHT
    this.type = options.type
    this.pos = { x, y }
    this.name = options.name
    this.width = options.width || 450
    this.height = options.height || windowHeight - UI_BAR_HEIGHT * 2
    this.components_container = createElement("div", "")
    this.setupComponents(options)
    this.setPosition(this.pos.x, this.pos.y)
  }

  clicked() {
    return (
      mouseX > this.pos.x &&
      mouseX < this.pos.x + this.width &&
      mouseY > this.pos.y &&
      mouseY < this.pos.y + this.height
    )
  }

  moveToTop() {
    panes.splice(panes.indexOf(this), 1)
    panes.push(this)
    for (let i = panes.length - 1; i >= 0; i--) {
      let pane = panes[i]
      pane.components_container.style("z-index", i * 10)
    }
  }

  setOffset(mouseX, mouseY) {
    this.offset = {
      x: mouseX - this.pos.x,
      y: mouseY - this.pos.y,
    }
  }
  setPosition(newX, newY) {
    let clamped_x = clamp(newX - this.offset.x, 0, windowWidth - this.width)
    let clamped_y = clamp(
      newY - this.offset.y,
      UI_BAR_HEIGHT,
      windowHeight - 50
    )
    this.pos = { x: clamped_x, y: clamped_y }
    this.components_container.position(this.pos.x, this.pos.y)
  }

  setupComponents(options) {
    this.components_container.style("width", this.width + "px")
    this.components_container.style("height", this.height + "px")
    this.components_container.addClass("pane_container")

    let first_row = createElement("div", "")
    first_row.addClass("pane_first_row")
    let title = createElement("div", this.name)
    title.addClass("pane_title")

    let button_close = createElement("button", "X")
    button_close.addClass("pane_close")
    button_close.mouseClicked(() => this.destroy())

    first_row.child(title)
    first_row.child(button_close)

    this.components_container.child(first_row)

    for (let component of options.components) {
      let component_container = createElement("div", "")
      component_container.addClass("pane_component_container")

      let component_label = createElement("span", component.label + ":")
      component_label.addClass("component_label")

      let component_value
      if (component.type == "text") {
        component_value = createElement("span", component.value)
      }
      component_container.child(component_label)
      component_container.child(component_value)
      this.components_container.child(component_container)
    }

    this.moveToTop()
  }

  destroy() {
    panes.splice(panes.indexOf(this), 1)
    this.components_container.remove()
    panes.splice(panes.indexOf(this), 1) // I don't know why this needs calling twice - but it does!
  }
}
;function closeExistingPanes(pane_type) {
  let was_open = false
  for (let pane of panes) {
    if (pane.type == pane_type) {
      pane.destroy()
      was_open = true
    }
  }
  return was_open
}

function openCityDetail() {
  let pane_type = "city_details"

  panes.push(
    new Pane({
      type: pane_type,
      name: town_name.value(),
      components: [
        {
          label: "Population",
          type: "text",
          value: Math.round(buildings.length * 2.5).toString(), // TODO: Switch to "GetPopulation()"
        },
      ],
    })
  )
}

function openBuildingDetail(building) {
  let pane_type = "building_details"
  panes.push(
    new Pane({
      type: pane_type,
      name: "Address",
      width: 300,
      height: 300,
      components: [
        {
          type: "text",
          label: "Type",
          value: building.type,
        },
      ],
    })
  )
}
;const ROAD_COLORS = ["#505557", "#404547", "#4d5254", "#535b5e", "#545657"]

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
;const BUILDING_CHANCE = 50
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

      buildings.push(building)
    }
  }

  btn_draw_roads.attribute("disabled", "")
  btn_confirm_city.removeAttribute("disabled", "")
  btn_generate_buildings.removeClass("click_me")
  btn_draw_roads.removeClass("click_me") // Just in case

  current_status = "city_finished"
}
;function GenerateDistrictName() {
  let nm1 = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "l",
    "m",
    "n",
    "p",
    "r",
    "s",
    "t",
    "w",
    "y",
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "y",
    "z",
    "bl",
    "br",
    "ch",
    "cl",
    "cr",
    "dr",
    "fl",
    "fr",
    "gl",
    "gr",
    "pl",
    "pr",
    "sc",
    "sh",
    "sk",
    "sl",
    "sm",
    "sn",
    "sp",
    "st",
    "sw",
    "tr",
    "tw",
    "wh",
    "wr",
    "sch",
    "scr",
    "sph",
    "shr",
    "spl",
    "spr",
    "str",
    "thr",
  ]
  let nm2 = [
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "ai",
    "eo",
    "ea",
    "ee",
    "oo",
    "oa",
    "ia",
    "io",
  ]
  let nm3 = [
    "br",
    "bl",
    "c",
    "ch",
    "cl",
    "ct",
    "ck",
    "cc",
    "d",
    "dg",
    "dw",
    "dr",
    "dl",
    "f",
    "g",
    "gg",
    "gl",
    "gw",
    "gr",
    "h",
    "k",
    "kr",
    "kw",
    "l",
    "ll",
    "lb",
    "ld",
    "lg",
    "lm",
    "ln",
    "lr",
    "lw",
    "lz",
    "m",
    "mr",
    "ml",
    "nw",
    "n",
    "nn",
    "ng",
    "nl",
    "p",
    "ph",
    "r",
    "rb",
    "rc",
    "rd",
    "rg",
    "rl",
    "rm",
    "rn",
    "rr",
    "rs",
    "rst",
    "rt",
    "rth",
    "rtr",
    "rw",
    "rv",
    "s",
    "ss",
    "sh",
    "st",
    "sth",
    "str",
    "sl",
    "sw",
    "t",
    "tb",
    "tl",
    "tg",
    "tm",
    "tn",
    "tw",
    "th",
    "tt",
    "v",
    "w",
    "wl",
    "wn",
    "x",
    "z",
  ]
  let nm4 = [
    "c",
    "d",
    "f",
    "ff",
    "g",
    "gg",
    "h",
    "l",
    "ll",
    "m",
    "mm",
    "n",
    "nn",
    "p",
    "pp",
    "r",
    "rr",
    "s",
    "ss",
    "t",
    "tt",
    "w",
  ]
  let nm5 = [
    "st",
    "sk",
    "sp",
    "nd",
    "nt",
    "nk",
    "mp",
    "rd",
    "ld",
    "lp",
    "rk",
    "lt",
    "lf",
    "pt",
    "ft",
    "ct",
    "t",
    "d",
    "k",
    "n",
    "p",
    "l",
    "g",
    "m",
    "s",
    "b",
    "c",
    "t",
    "d",
    "k",
    "n",
    "p",
    "l",
    "g",
    "m",
    "s",
    "b",
    "c",
  ]
  let nm6 = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "West",
    "East",
    "North",
    "South",
    "Little",
    "Upper",
    "Lower",
    "Fort",
    "Upper West",
    "Upper East",
    "Upper North",
    "Upper South",
    "Lower West",
    "Lower East",
    "Lower North",
    "Lower South",
    "Midtown",
    "Waterside",
    "Bayside",
    "Downtown",
  ]
  let nm7 = [
    "",
    "Acre",
    "Avenue",
    "Bazaar",
    "Boulevard",
    "Center",
    "Circle",
    "Corner",
    "Cross",
    "District",
    "East",
    "Garden",
    "Grove",
    "Heights",
    "Hill",
    "Hills",
    "Market",
    "North",
    "Park",
    "Place",
    "Plaza",
    "Point",
    "Road",
    "Row",
    "Side",
    "South",
    "Square",
    "Street",
    "Town",
    "Vale",
    "Valley",
    "West",
    "Wood",
    "Yard",
  ]
  let br = ""

  let names
  for (let i = 0; i < 10; i++) {
    let rnd6 = Math.floor(Math.random() * nm6.length)
    let rnd7 = Math.floor(Math.random() * nm7.length)
    if (rnd6 < 20) {
      while (rnd7 === 0) {
        rnd7 = Math.floor(Math.random() * nm7.length)
      }
    } else {
      rnd7 = 0
    }
    let rnd = Math.floor(Math.random() * nm1.length)
    let rnd2 = Math.floor(Math.random() * nm2.length)
    let rnd5 = Math.floor(Math.random() * nm5.length)
    if (i < 2) {
      names =
        nm6[rnd6] + " " + nm1[rnd] + nm2[rnd2] + nm5[rnd5] + "  " + nm7[rnd7]
    } else if (i < 4) {
      let rnd3 = Math.floor(Math.random() * nm3.length)
      let rnd4 = Math.floor(Math.random() * nm2.length)
      names =
        nm6[rnd6] +
        " " +
        nm1[rnd] +
        nm2[rnd2] +
        nm3[rnd3] +
        nm2[rnd4] +
        nm5[rnd5] +
        "  " +
        nm7[rnd7]
    } else if (i < 8) {
      let rnd3 = Math.floor(Math.random() * nm4.length)
      let rnd4 = Math.floor(Math.random() * nm2.length)
      names =
        nm6[rnd6] +
        " " +
        nm1[rnd] +
        nm2[rnd2] +
        nm4[rnd3] +
        nm2[rnd4] +
        nm5[rnd5] +
        "  " +
        nm7[rnd7]
    } else {
      let rnd3 = Math.floor(Math.random() * nm3.length)
      let rnd4 = Math.floor(Math.random() * nm2.length)
      rnd6 = Math.floor(Math.random() * nm4.length)
      rnd7 = Math.floor(Math.random() * nm2.length)
      if (i < 8) {
        names =
          nm6[rnd6] +
          " " +
          nm1[rnd] +
          nm2[rnd2] +
          nm3[rnd3] +
          nm2[rnd4] +
          nm4[rnd6] +
          nm2[rnd7] +
          nm5[rnd5] +
          "  " +
          nm7[rnd7]
      } else {
        names =
          nm6[rnd6] +
          " " +
          nm1[rnd] +
          nm2[rnd2] +
          nm4[rnd6] +
          nm2[rnd4] +
          nm3[rnd3] +
          nm2[rnd7] +
          nm5[rnd5] +
          "  " +
          nm7[rnd7]
      }
    }
  }
  return toTitleCase(names.trim())
}

function toTitleCase(str) {
  let string = str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
  return string.replace("  ", " ")
}
;function GenerateTownName() {
  let nm1 = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "l",
    "m",
    "n",
    "p",
    "r",
    "s",
    "t",
    "w",
    "y",
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "y",
    "z",
    "bl",
    "br",
    "ch",
    "cl",
    "cr",
    "dr",
    "fl",
    "fr",
    "gl",
    "gr",
    "pl",
    "pr",
    "sc",
    "sh",
    "sk",
    "sl",
    "sm",
    "sn",
    "sp",
    "st",
    "sw",
    "tr",
    "tw",
    "wh",
    "wr",
    "sch",
    "scr",
    "sph",
    "shr",
    "spl",
    "spr",
    "str",
    "thr",
  ]
  let nm2 = [
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "ai",
    "eo",
    "ea",
    "ee",
    "oo",
    "oa",
    "ia",
    "io",
  ]
  let nm3 = [
    "br",
    "bl",
    "c",
    "ch",
    "cl",
    "ct",
    "ck",
    "cc",
    "d",
    "dg",
    "dw",
    "dr",
    "dl",
    "f",
    "g",
    "gg",
    "gl",
    "gw",
    "gr",
    "h",
    "k",
    "kr",
    "kw",
    "l",
    "ll",
    "lb",
    "ld",
    "lg",
    "lm",
    "ln",
    "lr",
    "lw",
    "lz",
    "m",
    "mr",
    "ml",
    "nw",
    "n",
    "nn",
    "ng",
    "nl",
    "p",
    "ph",
    "r",
    "rb",
    "rc",
    "rd",
    "rg",
    "rl",
    "rm",
    "rn",
    "rr",
    "rs",
    "rst",
    "rt",
    "rth",
    "rtr",
    "rw",
    "rv",
    "s",
    "ss",
    "sh",
    "st",
    "sth",
    "str",
    "sl",
    "sw",
    "t",
    "tb",
    "tl",
    "tg",
    "tm",
    "tn",
    "tw",
    "th",
    "tt",
    "v",
    "w",
    "wl",
    "wn",
    "x",
    "z",
  ]
  let nm4 = [
    "c",
    "d",
    "f",
    "ff",
    "g",
    "gg",
    "h",
    "l",
    "ll",
    "m",
    "mm",
    "n",
    "nn",
    "p",
    "pp",
    "r",
    "rr",
    "s",
    "ss",
    "t",
    "tt",
    "w",
  ]
  let nm5 = [
    "st",
    "sk",
    "sp",
    "nd",
    "nt",
    "nk",
    "mp",
    "rd",
    "ld",
    "lp",
    "rk",
    "lt",
    "lf",
    "pt",
    "ft",
    "ct",
    "t",
    "d",
    "k",
    "n",
    "p",
    "l",
    "g",
    "m",
    "s",
    "b",
    "c",
    "t",
    "d",
    "k",
    "n",
    "p",
    "l",
    "g",
    "m",
    "s",
    "b",
    "c",
  ]
  let br = ""

  let names
  for (let i = 0; i < 10; i++) {
    let rnd = Math.floor(Math.random() * nm1.length)
    let rnd2 = Math.floor(Math.random() * nm2.length)
    let rnd5 = Math.floor(Math.random() * nm5.length)
    if (i < 2) {
      names = nm1[rnd] + nm2[rnd2] + nm5[rnd5]
    } else if (i < 4) {
      let rnd3 = Math.floor(Math.random() * nm3.length)
      let rnd4 = Math.floor(Math.random() * nm2.length)
      names = nm1[rnd] +
        nm2[rnd2] +
        nm3[rnd3] +
        nm2[rnd4] +
        nm5[rnd5]
    } else if (i < 8) {
      let rnd3 = Math.floor(Math.random() * nm4.length)
      let rnd4 = Math.floor(Math.random() * nm2.length)
      names = nm1[rnd] +
        nm2[rnd2] +
        nm4[rnd3] +
        nm2[rnd4] +
        nm5[rnd5]
    } else {
      let rnd3 = Math.floor(Math.random() * nm3.length)
      let rnd4 = Math.floor(Math.random() * nm2.length)
      rnd6 = Math.floor(Math.random() * nm4.length)
      rnd7 = Math.floor(Math.random() * nm2.length)
      if (i < 8) {
        names =nm1[rnd] +
          nm2[rnd2] +
          nm3[rnd3] +
          nm2[rnd4] +
          nm4[rnd6] +
          nm2[rnd7] +
          nm5[rnd5]
      } else {
        names =nm1[rnd] +
          nm2[rnd2] +
          nm4[rnd6] +
          nm2[rnd4] +
          nm3[rnd3] +
          nm2[rnd7] +
          nm5[rnd5]
      }
    }
  }
  return toTitleCase(names.trim())
}

function toTitleCase(str) {
  let string = str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
  return string.replace("  ", " ")
}
;let JobTypes  =  ["Apothecary","Artist","Baker","Barber","Blacksmith","Butcher","Farmer","Librarian","Cleric","Carpenter","Candlemaker","Cook","Gardener","Herbalist","Messenger","Guard","Painter","Physician","Potter","Scribe","Shoemaker","Spinster",]

let VoiceDescriptors = ["abrasive","acidic","adenoidal","airy","animated","anxious","authoritative","barbed","barely audible","baritone","barking","bass","big","blasé","bombastic","bored","boyish","bitter","bland","bleak","blunt","booming","brash","braying","breathy","breezy","bright","brisk","brittle","broken","bubbly","burbling","calm","caustic","casual","cheerful","childish","chirping","choked","clear","clipped","cloying","coarse","cold","cool","complacent","contented","contralto","cracking","creaky","croaking","crisp","crooning","curt","cultured","cynical","deep","devoid of emotion","discordant","dispirited","drawling","dreamy","dry","dulcet","dull","earnest","easy","falsetto","faint","feathery","feeble","firm","flat","fierce","forceful","fretful","gentle","girlish","glum","goofy","grating","grave","gravelly","grim","growling","gruff","guttural","hard","harsh","hateful","hearty","hesitant","high-pitched","hissing","hoarse","honeyed","hushed","husky","immense","indifferent","insinuating","intense","ironic","jubilant","lazy","lifeless","light","lilting","lively","loud","loving","low","matter-of-fact","mellifluous","melodious","mild","mocking","monotonous","muffled","musical","muted","nasal","nasty","neutral","nonchalant","obsequious","oily","piercing","piping","polished","quavering","querulous","quiet","ragged","rasping","raucous","raw","reedy","refined","resonant","ringing","roaring","robust","rough","rumbling","saccharine","sarcastic","savage","scornful","scratchy","screeching","serene","severe","shaky","sharp","shrill","sibilant","silken","silly","silvery","sincere","singsong","sleek","sluggish","slurring","sly","small","smarmy","smoky","smooth","snide","soft","solid","somber","sonorous","soothing","soprano","sour","spacey","stark","steely","stiff","stout","strained","strident","stony","suave","suggestive","surly","squeaky","squealing","sugary","sweet","sympathetic","tart","teasing","thick","thin","throaty","thunderous","tight","tender","tense","trembling","tremulous","trilling","uncertain","unctuous","unsteady","vague","velvety","warm","wavering","weak","weary","wheezy","whiny","wistful"]
let EyeDescriptors = ["large","small","narrow","sharp","squinty","round","wide-set","close-set","deep-set","sunken","bulging","protruding","wide","hooded","heavy-lidded","bedroom","bright","sparkling","glittering","flecked","dull","bleary","rheumy","cloudy","red-rimmed","beady","birdlike","cat-like","jewel-like","steely","hard",]
let EyebrowDescriptors = ["arched","straight","plucked","sparse","trim","dark","faint","thin","thick","unruly","bushy","heavy",]
let SkinDescriptors = ["lined","wrinkled","seamed","leathery","sagging","drooping","loose","clear","smooth","silken","satiny","dry","flaky","scaly","delicate","thin","translucent","luminescent","baby-soft","flawless","poreless","with large pores","glowing","dewy","dull","velvety","fuzzy","rough","uneven","mottled","dimpled","doughy","firm","freckled","pimply","pockmarked","blemished","pitted","scarred","bruised","veined","scratched","sunburned","weather-beaten","raw","tattooed",]
let FaceDescriptors = ["square","round","oblong","oval","elongated","narrow","heart-shaped","catlike","wolfish","high forehead","broad forehead","prominent brow ridge","protruding brow bone","sharp cheekbones","high cheekbones","angular cheekbones","hollow cheeks","square jaw","chiseled","sculpted","craggy","soft","jowly","jutting chin","pointed chin","weak chin","receding chin","double chin","cleft chin","dimple in chin","visible Adam’s apple",]
let NoseDescriptors = ["snub","dainty","button","turned-up","long","broad","thin","straight","pointed","crooked","aquiline","Roman","bulbous","flared","hawk","strong",]
let MouthDescriptors = ["thin","narrow","full","lush","Cupid’s bow","rosebud","dry","cracked","chapped","moist","glossy","straight teeth","gap between teeth","gleaming white teeth","overbite","underbite",]
let FacialHairDescriptors = ["clean-shaven","smooth-shaven","beard","neckbeard","goatee","moustache","sideburns","mutton-chop sideburns","stubble","a few days’ growth of beard","five o’ clock shadow",]
let HairDescriptors = ["long","short","shoulder-length","loose","limp","dull","shiny","glossy","sleek","smooth","luminous","lustrous","spiky","stringy","shaggy","tangled","messy","tousled","windblown","unkempt","bedhead","straggly","neatly combed","parted","slicked down","cropped","clipped","buzz cut","crewcut","bob","mullet","curly","bushy","frizzy","wavy","straight","lanky","dry","oily","greasy","layers","corkscrews","spirals","ringlets","braids","widow’s peak","bald","shaved","comb-over","afro","thick","luxuriant","voluminous","full","wild","untamed","bouncy","wispy","fine","thinning",]
let BodyDescriptors = ["tall","average height","short","petite","tiny","compact","big","large","burly","beefy","bulky","brawny","barrel-chested","heavy-set","fat","overweight","obese","flabby","chunky","chubby","pudgy","pot-bellied","portly","thick","stout","lush","plush","full-figured","ample","rounded","generous","voluptuous","curvy","hourglass","plump","long-legged","gangling","lanky","coltish","lissome","willowy","lithe","lean","slim","slender","trim","thin","skinny","emaciated","gaunt","bony","spare","solid","stocky","wiry","rangy","sinewy","stringy","ropy","sturdy","strapping","powerful","hulking","fit","athletic","toned","built","muscular","chiseled","taut","ripped","Herculean","broad-shouldered","sloping shoulders","bowlegged",]
let HandDescriptors = ["delicate","small","large","square","sturdy","strong","smooth","rough","calloused","elegant","plump","manicured","stubby fingers","long fingers","ragged nails","grimy fingernails","ink-stained",]

let SkinColours = ["amber","bronze","cinnamon","copper","dark brown","deep brown","ebony","honey","golden","pale","pallid","pasty","fair","light","creamy","alabaster","ivory","bisque","milk","porcelain","chalky","sallow","olive","peach","rosy","ruddy","florid","russet","tawny","fawn",]
let EyeColours = ["chestnut","chocolate brown","cocoa brown","coffee brown","mocha","mahogany","sepia","sienna brown","mink brown","copper","amber","cognac","whiskey","brandy","honey","tawny","topaz","hazel","obsidian","onyx","coal","raven","midnight","sky blue","sunny blue","cornflower blue","steel blue","ice blue","Arctic blue","glacial blue","crystal blue","cerulean","electric blue","azure","lake blue","aquamarine","turquoise","denim blue","slate","storm blue","silver","chrome","platinum","pewter","smoky gray","ash gray","concrete gray","dove gray","shark gray","fog gray","gunmetal gray","olive","emerald","leaf green","moss green",]
let HairColours = ["black","blue-black","jet black","raven","ebony","inky black","midnight","sable","salt and pepper","silver gray","charcoal gray","steel gray","white","snow-white","brown","brunette","chocolate brown","coffee brown","ash brown","brown sugar","nut brown","caramel","tawny brown","toffee brown","red","ginger","auburn","Titian-haired","copper","strawberry blonde","butterscotch","honey","wheat","blonde","golden","sandy blond","flaxen","fair-haired","bleached","platinum",];function setup() {
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
        selected_building = building
        openBuildingDetail(building)
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

  btn_draw_roads.removeAttribute("hidden", "")
  btn_generate_buildings.removeAttribute("hidden", "")
  btn_confirm_city.removeAttribute("hidden", "")
  btn_open_city_details.attribute("hidden", "")

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

  btn_draw_roads.attribute("hidden", "")
  btn_generate_buildings.attribute("hidden", "")
  btn_confirm_city.attribute("hidden", "")
  btn_open_city_details.removeAttribute("hidden", "")

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
  btn_generate_city.mouseClicked(newCity)
  btn_generate_city.addClass("click_me")

  size_slider = createSlider(100, 350, 150, 10)
  size_slider.style("width", "95px")
  size_slider.addClass("size_slider")

  new_city_container.child(btn_generate_city)
  new_city_container.child(size_slider)

  btn_draw_roads = createButton("🚧")
  btn_draw_roads.mouseClicked(() => {
    current_status = "draw_roads"
    btn_draw_roads.removeClass("click_me")
  })

  btn_generate_buildings = createButton("🏠")
  btn_generate_buildings.mouseClicked(generateBuildings)

  btn_confirm_city = createButton("✅")
  btn_confirm_city.mouseClicked(confirmCity)
  btn_confirm_city.attribute("disabled", "")

  btn_open_city_details = createButton("📜")
  btn_open_city_details.mouseClicked(() => {
    if (!closeExistingPanes("city_details")) {
      openCityDetail()
    }
  })
  btn_open_city_details.attribute("hidden", "")

  left_items.child(new_city_container)
  left_items.child(btn_draw_roads)
  left_items.child(btn_generate_buildings)
  left_items.child(btn_confirm_city)
  left_items.child(btn_open_city_details)

  town_name = createInput("")
  town_name.addClass("townNameInput")
  town_name.value("Generate your town...")

  right_items = createElement("div")
  right_items.addClass("side_items")

  btn_save = createButton("💾")
  btn_save.mouseClicked(saveToJson)

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
