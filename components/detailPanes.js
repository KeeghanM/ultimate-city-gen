function closeExistingPanes(pane_type) {
  let was_open = false
  for (let pane of panes) {
    console.log({ message: "IN", pane })
    if (pane.type == pane_type) {
      pane.destroy()
      was_open = true
    }
  }
  console.log({ was_open, pane_type })
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
