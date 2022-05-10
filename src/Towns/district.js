const Bulding = require("./building")

class District {
  constructor(props) {
    this.name = props.name || generateName()
    this.blocks = generateBlocks()
  }
}

function generateName() {
  return "Elfy Hollow"
}

function generateBlocks() {
  let blocks = []
  for (let i = 0; i < 10; i++) {
    let block = {
      buildings: [],
    }

    for (let i = 0; i < 10; i++) {
      let building = new Bulding({ type: "house" })
      block.buildings.push(building)
    }
    blocks.push(block)
  }
  return blocks
}
