function saveToJson() {
  let town = JSON.stringify({
    grid,
    buildings,
    city_inhabitants,
    name: town_name.value(),
  })

  alert('Size of sample is: ' + town.length)
  let compressed = LZString.compress(town)
  alert('Size of compressed is: ' + compressed.length)
  download(
    compressed,
    town_name.value() + '.ucg',
    'text/plain'
  )
}

function loadFromJson(file) {
  if (file.subtype !== 'json') return

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
