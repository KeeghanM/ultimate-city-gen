function closeExistingPanes(pane_type) {
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
  closeExistingPanes(pane_type)

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
