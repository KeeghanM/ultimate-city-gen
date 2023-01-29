class Pane {
  constructor(options) {
    this.offset = { x: panes.length * 50, y: panes.length * 50 }
    let x = options.x || this.offset.x
    let y = options.y || UI_BAR_HEIGHT + this.offset.y
    this.pos = { x, y }
    this.name = options.name
    this.width = options.width || 450
    this.height = options.height || windowHeight - UI_BAR_HEIGHT * 2
    this.components_container = createElement("div", "")
    this.setupComponents(options)
    this.setPosition(this.pos.x, this.pos.y)
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
    for (let i = panes.length - 1; i >= 0; i--) {
      let pane = panes[i]
      pane.components_container.style("z-index", i * 10)
    }
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
    this.components_container.position(this.pos.x, this.pos.y)
  }

  setupComponents(options) {
    this.components_container.style("width", this.width + "px")
    this.components_container.style("height", this.height + "px")
    this.components_container.addClass("pane_container")

    let first_row = createElement("div", "")
    first_row.addClass("pane_first_row")
    let title = createElement("div", this.name)
    title.addClass("pane_title")

    let button_close = createElement("button", "X")
    button_close.addClass("pane_close")
    button_close.mouseClicked(() => this.destroy())

    first_row.child(title)
    first_row.child(button_close)

    this.components_container.child(first_row)

    for (let component of options.components) {
      console.log(component)
      // TODO: Create actual elements
    }

    this.moveToTop()
  }

  destroy() {
    this.components_container.remove()
    panes.splice(panes.indexOf(this), 1)
  }
}
