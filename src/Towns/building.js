class Bulding {
  constructor(props) {
    this.type = props.type
    this.description = props.description || ""
    this.position = props.position || [0, 0]
    this.address = props.address || ""
  }
}
