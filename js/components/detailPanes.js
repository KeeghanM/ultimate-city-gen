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
  let pane_name =
    building.type == "house" ? "House Address" : building.business_name
  let components =
    building.type == "house"
      ? [
          {
            type: "list_click",
            label: "Inhabitants",
            value: building.inhabitants,
            open: true,
          },
        ]
      : [
          { type: "tags", label: "Tags", value: building.types_list },
          {
            type: "list_click",
            label: "Employees",
            value: building.inhabitants,
          },
          {
            type: "list",
            label: "Shop",
            value: ["Sword - 10gp", "Bag - 10s"],
            open: true,
          },
        ]
  panes.push(
    new Pane({
      type: pane_type,
      name: pane_name,
      height: 300,
      components,
    })
  )
}
