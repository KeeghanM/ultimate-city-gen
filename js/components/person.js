class Person {
  constructor(options={}) {
    this.id = options.id ? options.id : generateUniqueId()
    let random_race = Math.random() * 100 //TODO: Base on city race split
    this.race = options.race
      ? options.race
      : random_race < 33
      ? "Human"
      : random_race < 66
      ? "Elf"
      : "Dwarf"
    let max_age = this.race == "Human" ? 80 : this.race == "Elf" ? 500 : 160
    this.age = options.age
      ? options.age
      : Math.floor(Math.random() * (max_age - 20)) + 20 // between 20 & max age

    let random_gender = Math.random() * 100
    this.gender = options.gender
      ? options.gender
      : random_gender < 49
      ? "Male"
      : random_race < 98
      ? "Female"
      : "Non-Binary"

    let gender_selector =
      this.gender == "Female"
        ? 1
        : this.gender == "Male"
        ? 0
        : Math.random() < 0.5
        ? 0
        : 1
    let name = options.name
      ? options.name
      : this.race == "Human"
      ? GenerateHumanName(gender_selector)
      : this.race == "Elf"
      ? GenerateElfName(gender_selector)
      : GenerateDwarfName(gender_selector)
    this.first_name = name.split(" ")[0]
    this.last_name = name.split(" ")[1]

    this.job = options.job ? options.job : "Unemployed"
    this.place_of_employment = undefined
    this.home = undefined
    this.description = undefined

    this.partner = options.partner ? options.partner : undefined
    this.children = []
    this.parents = []
  }

  makeABaby() {
    let baby_age = Math.floor(Math.random() * (this.age - 20)) // Anything from 0 up to 20 years younger than parent
    let baby = new Person({ age: baby_age, race: this.race })
    if (baby_age > 20) {
      baby.findJob()
    }
    baby.parents.push(this.id)

    if (this.partner) {
      baby.parents.push(this.partner)
      let partner_index = indexFromId(city_inhabitants,this.partner) 
      city_inhabitants[partner_index].children.push(baby.id)
    }

    this.children.push(baby.id)
    city_inhabitants.push(baby)
  }

  findJob() {
    let place_of_work
    let counter = 0
    while (!place_of_work && counter < 20) {
      let potential_work =
        buildings[Math.floor(Math.random() * buildings.length)]
      if (potential_work.type == "business" || potential_work == "tavern") {
        place_of_work = potential_work
      }
      counter++
    }
    if (place_of_work) {
      this.place_of_employment = place_of_work.id
      this.job =
        place_of_work.titles[
          Math.floor(Math.random() * place_of_work.titles.length)
        ]
      place_of_work.inhabitants.push(this.id)
    }
  }

  formatDisplay() {
    return (
      this.first_name +
      " " +
      this.last_name +
      " | " +
      this.age +
      "yr old " +
      this.job +
      " " +
      this.race 
    )
  }

  getName() {
    return this.first_name + " " + this.last_name
  }
}
