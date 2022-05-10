const { Person } = require("./person")
const { District } = require("./district")
const { Voronoi } = require("./generators/voronoi")

const SIZES = {
  Small: {
    minDistricts: 2,
    maxDistricts: 5,
    minPopulation: 800,
    maxPopulation: 800,
  },
  Medium: {
    minDistricts: 5,
    maxDistricts: 9,
    minPopulation: 1200,
    maxPopulation: 1700,
  },
  Large: {
    minDistricts: 8,
    maxDistricts: 13,
    minPopulation: 3500,
    maxPopulation: 6000,
  },
}

class Town {
  constructor(props) {
    this.name = props.name || generateName()
    this.size = props.size || "Medium"
    this.districts = generateDistricts(this.size)
    this.people = generateInhabitants(this.size, this.districts)
  }

  exportToJson() {
    return JSON.stringify(this)
  }
}

function generateName() {
  return undefined
}

function generateDistricts(size) {
  let sizeStats = SIZES[size]
  let districtCount = Math.floor(
    Math.random() * (sizeStats.maxDistricts - sizeStats.minDistricts + 1) +
      sizeStats.minDistricts
  )

  let districts = []
  for (let i = 0; i < districtCount; i++) {
    let district = new District({})
    districts.push(district)
  }

  return districts
}

function generateInhabitants(size, districts) {
  let sizeStats = SIZES[size]
  let population = Math.floor(
    Math.random() * (sizeStats.maxPopulation - sizeStats.minPopulation + 1) +
      sizeStats.minPopulation
  )
  let inhabitants = []

  for (let district of districts) {
    for (let block of district.blocks) {
      for (let building of block.buildings) {
        let type = building.type

        let age = Math.floor(Math.random() * (60 - 20 + 1) + 20)
        let parent = new Person({ age })
        inhabitants.push(parent)

        if (type == "house") {
          // 80% Chance of having a partner
          let r = Math.random()
          if (r > 0.8) {
            let secondAge = Math.floor(
              Math.random() * (parent.age + 10 - (parent.age - 10) + 1) +
                (parent.age + 10)
            )
            let secondParent = new Person({ age: secondAge, race: parent.race })
            inhabitants.push(secondParent)

            let r2 = Math.random()
            let kidCount = r2 > 0.6 ? 0 : r2 > 0.3 ? 1 : 2
            for (let i = 0; i < kidCount; i++) {
              let kidAge = Math.floor(Math.random() * (15 - 2 + 1) + 2)
              let kid = new Person({
                age: kidAge,
                parents: [parent, secondParent],
              })
              inhabitants.push(kid)
            }
          }
        }
      }
    }
    let person = new Person({})
    inhabitants.push(person)
  }

  while (inhabitants.length < population) {
    let person = new Person({})
    inhabitants.push(person)
  }

  return inhabitants
}
