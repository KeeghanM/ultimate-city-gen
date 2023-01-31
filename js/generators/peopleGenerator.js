function generatePeople() {
  // Firstly, go through existing people from the building generation
  // and find homes for them. We will try to find the closest home possible.
  // Once homed - we can then decide if the people will have a family.
  // Generate the family, and if needed - put them in places of work!

  // Because we're looping existing people, we need a temp
  // storage for any new people we make. Hence:
  let new_inhabitants = []
  for (let person of city_inhabitants) {
    // Born children get pushed directly to city_inhabitants
    // So to skip these, just check if there are parents
    // All "Original" inhabitants won't have parents
    if (person.parents.length > 0) continue

    let place_of_work_index = buildings.indexOf(person.place_of_employment)
    for (
      let step_count = 1;
      step_count < buildings.length / 2 - 1;
      step_count++
    ) {
      // Search outwards in both directions to find an empty house
      // First forwards
      let potential_house =
        buildings[clamp(place_of_work_index + step_count, 0, buildings.length)]
      if (
        potential_house.type == "house" &&
        potential_house.inhabitants.length == 0
      ) {
        potential_house.inhabitants.push(person)
        person.home = potential_house
        break
      }

      // Then backwards (note the MINUS instead of a PLUS)
      potential_house =
        buildings[clamp(place_of_work_index - step_count, 0, buildings.length)]
      if (
        potential_house.type == "house" &&
        potential_house.inhabitants.length == 0
      ) {
        potential_house.inhabitants.push(person)
        person.home = potential_house
        break
      }
    }

    // Let's see if this person has a partner or not
    let chance_of_partner = person.home ? 80 : 30
    if (Math.random() * 100 < chance_of_partner) {
      let partner = new Person({
        age: Math.round(person.age + Math.random() * 10), // Always go up, to avoid noncing
        race: person.race,
        partner: person,
        home: person.home,
      })
      partner.findJob()
      person.partner = partner
      new_inhabitants.push(partner)
    }

    // Recursive function to generate children
    maybeHaveAKid(person)
  }

  // Add any new people in
  city_inhabitants = city_inhabitants.concat(new_inhabitants)
  current_status = "city_finished"
}

function maybeHaveAKid(person) {
  let chance_of_children = 80
  if (!person.home) chance_of_children -= 40
  if (!person.partner) chance_of_children -= 20

  chance_of_children -= person.children.length * 20 // Max children should be 4
  if (Math.random() * 100 < chance_of_children) {
    person.makeABaby()
    // Recursive! Will stop eventually due to the length of children array
    maybeHaveAKid(person)
  }
}
