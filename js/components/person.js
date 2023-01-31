class Person {
  constructor(options) {
    let random_race = Math.random() * 100 //TODO: Base on city race split
    this.race =
      options.race || random_race < 33
        ? "Human"
        : random_race < 66
        ? "Elf"
        : "Dwarf"

    let max_age = this.race == "Human" ? 80 : this.race == "Elf" ? 500 : 160
    this.age = options.age || Math.floor(Math.random() * (max_age - 20)) + 20 // between 20 & max age

    let name =
      options.name || this.race == "Human"
        ? GenerateHumanName()
        : this.race == "Elf"
        ? GenerateElfName()
        : GenerateDwarfName()
    this.first_name = name.split(" ")[0]
    this.last_name = name.split(" ")[1]

    this.job = options.job || "Unemployed"
    this.place_of_employment = undefined
    this.home = undefined
    this.description = undefined
  }
}
