function openCityDetail() {
  let pane_type = "city_details"
  // if it's already open, close it
  for (let pane of panes) {
    if (pane.type == pane_type) {
      pane.destroy()
    }
  }

  panes.push(
    new Pane({
      type: pane_type,
      name: town_name.value(),
      x: 25,
      y: 25,
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
