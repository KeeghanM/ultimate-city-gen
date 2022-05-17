exports.Building = class Bulding {
  constructor(props) {
    this.type = props.type
    this.description = props.description || ""
    this.position = props.position || [0, 0]
    this.size = props.size || [
      Math.round(Math.random() * 8 + 8),
      Math.round(Math.random() * 8 + 8),
    ]
    this.address = props.address || ""
  }

  isOverlapping(other) {
    let maxAx = this.position[0] + this.size[0]
    let minAx = this.position[0]
    let maxAy = this.position[1] + this.size[1]
    let minAy = this.position[1]

    let maxBx = other.position[0] + other.size[0]
    let minBx = other.position[0]
    let maxBy = other.position[1] + other.size[1]
    let minBy = other.position[1]

    return !(
      maxAx >= minBx &&
      minAx <= maxBx &&
      minAy <= maxBy &&
      maxAy >= minBy
    )
  }
}
