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
  getBox() {
    return {
      top: this.position[1],
      right: this.position[0] + this.size[0],
      bottom: this.position[1] + this.size[1],
      left: this.position[0],
    }
  }
  getPolyPoints() {
    return [
      { x: this.position[0], y: this.position[1] },
      { x: this.position[0] + this.size[0], y: this.position[1] },
      {
        x: this.position[0] + this.size[0],
        y: this.position[1] + this.size[1],
      },
      { x: this.position[0], y: this.position[1] + this.size[1] },
    ]
  }
}
