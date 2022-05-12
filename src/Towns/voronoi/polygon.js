exports.Polygon = class Polygon {
  constructor(points) {
    this.points = points
    this.edges = this.calcEdges()
  }
  calcEdges() {
    let edges = []
    for (let i = 0; i < this.points.length; i++) {
      let p1 = this.points[i]
      let p2 = i < this.points.length - 1 ? this.points[i + 1] : this.points[0]

      edges.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    }

    return edges
  }

  area() {
    let area = 0
    for (let index = 0; index < this.points.length; index++) {
      let x1 = this.points[index].x
      let y1 = this.points[index].y
      let x2 =
        index < this.points.length - 1
          ? this.points[index + 1].x
          : this.points[0].x
      let y2 =
        index < this.points.length - 1
          ? this.points[index + 1].y
          : this.points[0].y
      area += x1 * y2 - y1 * x2
    }

    return Math.abs(area / 2)
  }

  centre() {
    let bBox = this.boundingBox()
    let x = bBox.xl + (bBox.xr - bBox.xl) / 2
    let y = bBox.yt + (bBox.yb - bBox.yt) / 2
    return { x, y }
  }

  boundingBox() {
    let xMin = Infinity
    let xMax = 0
    let yMin = Infinity
    let yMax = 0
    for (let point of this.points) {
      xMin = point.x < xMin ? point.x : xMin
      xMax = point.x > xMax ? point.x : xMax
      yMin = point.y < yMin ? point.y : yMin
      yMax = point.y > yMax ? point.y : yMax
    }
    let bbox = { xl: xMin, xr: xMax, yt: yMin, yb: yMax }
    return bbox
  }

  draw(c) {
    noFill()
    if (c) fill(c)
    beginShape()
    for (let point of this.points) {
      vertex(point.x, point.y)
    }
    endShape(CLOSE)
  }
}
