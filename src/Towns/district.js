const { Intersect } = require("./voronoi/clipping")
const { GenerateDistrictName } = require("./generators/districtNames")
const { Polygon } = require("./voronoi/polygon")
const { OffsetPath } = require("./voronoi/offset")
const Voronoi = require("./voronoi/rhill-voronoi-core.min.js")

exports.District = class District {
  constructor(props) {
    this.name = props.name || GenerateDistrictName()
    this.poly = props.poly || new Polygon([])
    this.children = []
    this.site = props.site

    this.col = color(160, 82, 45, 60)
    if (props.children) {
      this.loadChildren(props.children)
    }
  }

  loadChildren(children) {
    for (let child of children) {
      let newChild = new District(
        child.site,
        child.name,
        new Polygon(child.poly.points),
        child.children
      )
      this.children.push(newChild)
    }
  }

  draw(size) {
    strokeWeight(size)
    if (this.poly.points) {
      this.poly.draw(this.col)
      for (let child of this.children) {
        child.draw(size > 1 ? size - 1 : 0)
      }
    }
  }

  findAllClicked(x, y, returnArr) {
    if (pointInPoly(x, y, this.poly)) {
      returnArr.push(this)
      for (let child of this.children) {
        child.findAllClicked(x, y, returnArr)
      }
    }
  }

  calcV(clipSize) {
    let vor = new Voronoi()
    if (this.children.length > 1) {
      let siteList = []
      for (let child of this.children) {
        siteList.push(child.site)
      }

      let diagram = vor.compute(siteList, this.poly.boundingBox())
      for (let cell of diagram.cells) {
        let poly = new Polygon([])
        for (let he of cell.halfedges) {
          let sp = he.getStartpoint()
          poly.points.push({ x: sp.x, y: sp.y })
        }

        // Find the right child to put the re-calced cell into
        for (let child of this.children) {
          if (cell.site.x == child.site.x && cell.site.y == child.site.y) {
            let clippedPoints = Intersect(poly.points, this.poly.points)
            let insetPointsV = OffsetPath(clippedPoints[0], clipSize)
            let insetPoints = []
            for (let v of insetPointsV[0]) {
              insetPoints.push({ x: v.x, y: v.y })
            }
            poly.points = insetPoints

            child.poly = poly
            child.calcV(clipSize - 2)
          }
        }
      }
    }
  }
}
