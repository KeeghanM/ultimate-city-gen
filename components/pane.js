class Pane {
  constructor(options) {
    this.offset = { x: panes.length * 50, y: panes.length * 50 }
    this.pos = { x: 0 + this.offset.x, y: UI_BAR_HEIGHT + this.offset.y }
    this.name = options.name
    this.width = options.width || 450
    this.height = options.height || windowHeight - UI_BAR_HEIGHT * 2
    this.components_container = createElement("div", "")
    for (let component of options.components) {
      console.log(component)
      // TODO: Create actual elements
    }
  }

  draw() {
    stroke(0)
    strokeWeight(4)
    fill(color_light)
    rectMode(CORNER)
    rect(this.pos.x, this.pos.y, this.width, this.height)

    this.components_container.position(this.pos.x, this.pos.y)
  }

  clicked() {
    return (
      mouseX > this.pos.x &&
      mouseX < this.pos.x + this.width &&
      mouseY > this.pos.y &&
      mouseY < this.pos.y + this.height
    )
  }

  moveToTop() {
    panes.splice(panes.indexOf(this), 1)
    panes.push(this)
  }

  setOffset(mouseX, mouseY) {
    this.offset = {
      x: mouseX - this.pos.x,
      y: mouseY - this.pos.y,
    }
  }
  setPosition(newX, newY) {
    let clamped_x = clamp(newX - this.offset.x, 0, windowWidth - this.width)
    let clamped_y = clamp(
      newY - this.offset.y,
      UI_BAR_HEIGHT,
      windowHeight - 50
    )
    this.pos = { x: clamped_x, y: clamped_y }
  }
}
