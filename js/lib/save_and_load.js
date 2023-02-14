function saveToJson() {
  let town = JSON.stringify({
    grid,
    buildings,
    city_inhabitants,
    name: town_name.value(),
  })

  let compressed = LZString.compressToUTF16(town)
  download(
    compressed,
    town_name.value() + '.ucg',
    'text/plain'
  )
}

function loadFromJson(compressed_json) {
  let loaded_town = JSON.parse(LZString.decompressFromUTF16(compressed_json))


  if (!loaded_town.buildings || !loaded_town.grid || !loaded_town.name) return

  grid = loaded_town.grid
  town_name.value(loaded_town.name)
  buildings = []
  city_inhabitants = []

  // Need to reconstruct the building's and inhabitants as objects
  for (let loaded_building of loaded_town.buildings) {
    console.log(loaded_building)
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
