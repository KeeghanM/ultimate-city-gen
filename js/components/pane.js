class Pane {
  constructor(options) {
    this.offset = { x: 0, y: 0 }
    let x = options.x || 0
    let y = options.y || UI_BAR_HEIGHT
    this.type = options.type
    this.pos = { x, y }
    this.name = options.name
    this.components_container = createElement("div", "")
    this.setupComponents(options)
    this.setPosition(this.pos.x, this.pos.y)
  }

  clicked() {
    return (
      mouseX > this.pos.x &&
      mouseX < this.pos.x + this.components_container.elt.offsetWidth &&
      mouseY > this.pos.y &&
      mouseY < this.pos.y + this.components_container.elt.offsetHeight
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
    let clamped_x = clamp(
      newX - this.offset.x,
      0,
      windowWidth - this.components_container.elt.offsetWidth
    )
    let clamped_y = clamp(
      newY - this.offset.y,
      UI_BAR_HEIGHT,
      windowHeight - 50
    )
    this.pos = { x: clamped_x, y: clamped_y }
    this.components_container.position(this.pos.x, this.pos.y)
  }

  setupComponents(options) {
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
      let component_container
      if (component.type == "text") {
        component_container = createElement("div", "")
        component_container.addClass("pane_component_container")

        let component_label = createElement("span", component.label + ":")
        component_label.addClass("component_label")

        let component_value = createElement("span", component.value)
        component_container.child(component_label)
        component_container.child(component_value)
      }
      if (component.type == "list_click" || component.type == "list") {
        component_container = createElement("details", "")
        component_container.addClass("pane_component_container")
        if (component.open) component_container.attribute("open", "")

        let component_label = createElement("summary", component.label)
        let list = createElement("ul", "")
        for (let list_item of component.value) {
          let text
          if (component.type == "list_click") {
            // For now we know this is a person. TODO: Make this not shit
            text = list_item.first_name + " " + list_item.last_name // TODO: Make this a thing that is clickable to open a new pane
          } else {
            text = list_item
          }
          let list_item_element = createElement("li", text)
          list.child(list_item_element)
        }
        component_container.child(component_label)
        component_container.child(list)
      }
      if (component.type == "tags") {
        component_container = createElement("ul", "")
        component_container.addClass("pane_tags")
        for (let list_item of component.value) {
          let list_item_element = createElement("li", list_item)
          component_container.child(list_item_element)
        }
      }
      this.components_container.child(component_container)
    }

    this.moveToTop()
  }

  destroy() {
    panes.splice(panes.indexOf(this), 1)
    this.components_container.remove()
    panes.splice(panes.indexOf(this), 1) // I don't know why this needs calling twice - but it does!
  }
}
