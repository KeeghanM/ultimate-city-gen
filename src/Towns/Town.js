const { District } = require("./district")

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

exports.Town = class Town {
  constructor(props) {
    this.name = props.name || generateName()
    this.size = props.size || "Medium"
    this.district
  }

  setDistrict(poly) {
    let site = poly.centre()

    this.district = new District({
      name: this.name,
      site,
      poly,
    })
  }

  exportToJson() {
    return JSON.stringify(this)
  }
}

function generateName() {
  return "Silverhollow"
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
