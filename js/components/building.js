const ROOF_COLORS = [
  '#634902',
  '#632805',
  '#5e2c0e',
  '#57321d',
  '#4a220c',
  '#451c1a',
  '#8f342f',
  '#695b3d',
]

class Building {
  constructor(options = {}) {
    this.id = options.id ? options.id : generateUniqueId()
    this.cells = options.cells ? options.cells : []
    this.type = options.type ? options.type : ''
    this.points = options.points ? options.points : []
    this.corners = options.corners ? options.corners : []
    this.roof_lines = options.roof_lines ? options.roof_lines : []
    this.roof_points = options.roof_points ? options.roof_points : []
    this.color = options.color
      ? options.color
      : ROOF_COLORS[Math.floor(Math.random() * ROOF_COLORS.length)]
    this.inhabitants = options.inhabitants ? options.inhabitants : []
    this.business_name = options.business_name ? options.business_name : ""
    this.titles = options.titles ? options.titles : []
    this.types_list = options.types_list ? options.types_list : []
  }

  draw() {
    fill(this == selected_building ? '#0096FF' : this.color)

    stroke(0)
    strokeWeight(0.5)

    beginShape()
    for (let point of this.points) {
      vertex(point.x, point.y)
    }
    endShape(CLOSE)
    for (let roof_line of this.roof_lines) {
      line(
        roof_line.start_x,
        roof_line.start_y,
        roof_line.end_x,
        roof_line.end_y
      )
    }
    if (this.roof_points.length > 1) {
      for (let i = 0; i < this.roof_points.length - 1; i++) {
        let point = this.roof_points[i]
        let next_point = this.roof_points[i + 1]
        line(point.x, point.y, next_point.x, next_point.y)
      }
    }
  }
}
