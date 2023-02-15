function saveToFile() {
  let compressed = compressCity()

  download(
    compressed,
    town_name.value() + '.ucg',
    'text/plain'
  )
}

function loadFromFile(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    decompressCity(e.target.result)
  }
  reader.readAsText(file.file)
}

function saveToLocalStorage() {
  try { 
    let compressed = compressCity()
    localStorage.setItem(town_name.value(),compressed)
    cuteAlert({
      type: "success",
      title: "Saved!",
      message: "Your town has been saved successfully!",
      buttonText: "Ok"
    })
  } catch(err) {
    cuteAlert({
      type: "error",
      title: "Error",
      message: "Something went wrong: " + err,
      buttonText: "Oh.."
    })
  }
}

function loadFromLocalStorage(name) {
  let compressed = localStorage.getItem(name)
  decompressCity(compressed)
}

function compressCity() {
  let town = JSON.stringify({
    grid,
    buildings,
    city_inhabitants,
    name: town_name.value(),
  })

  return LZString.compressToUTF16(town)
}

function decompressCity(compressed_json) {
  let loaded_town = JSON.parse(LZString.decompressFromUTF16(compressed_json))

  if (!loaded_town.buildings || !loaded_town.grid || !loaded_town.name) return //TODO: Error Handling

  grid = loaded_town.grid
  town_name.value(loaded_town.name)
  buildings = []
  city_inhabitants = []

  // Need to reconstruct the building's and inhabitants as objects
  for (let loaded_building of loaded_town.buildings) {
    buildings.push(new Building(loaded_building))
  }
  for (let loaded_person of loaded_town.city_inhabitants) {
    city_inhabitants.push(new Person(loaded_person))
  }

  confirmCity()
  redraw()
}