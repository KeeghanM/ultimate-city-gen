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
          value: city_inhabitants.length,
        },
      ],
    })
  )
}

function openBuildingList() {
  let pane_type = "building_list"

  let businesses = buildings.filter((building) => building.type != "house")
  let houses = buildings.filter((building) => building.type == "house")

  panes.push(
    new Pane({
      type: pane_type,
      name: "All Buildings",
      components: [
        {
          label: "Businesses",
          type: "list_click",
          searchable: true,
          open: true,
          value: businesses,
        },
        {
          label: "Houses",
          type: "list_click",
          searchable: true,
          open: true,
          value: houses,
        },
      ],
    })
  )
}
function openPeopleList() {
  let pane_type = "people_list"
  let formatted_people = city_inhabitants.map((person) => {
    return (
      person.first_name +
      " " +
      person.last_name +
      " | " +
      person.age +
      "yr old " +
      person.race +
      " " +
      person.job
    )
  })
  panes.push(
    new Pane({
      type: pane_type,
      name: "All People",
      components: [
        {
          label: formatted_people.length + " Inhabitants",
          type: "list",
          searchable: true,
          open: true,
          value: formatted_people,
        },
      ],
    })
  )
}

function openBuildingDetail(building) {
  let pane_type = "building_details"
  let pane_name = building.type == "house" ? "House" : building.business_name
  let components =
    building.type == "house"
      ? [
          {
            label: "Address",
            type: "text",
            value: "Coming soon", // TODO: Generate addresses
          },
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
