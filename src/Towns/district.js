const { Intersect } = require("./voronoi/clipping")
const { GenerateDistrictName } = require("./generators/districtNames")
const { Polygon } = require("./voronoi/polygon")
const { OffsetPath } = require("./voronoi/offset")
const Voronoi = require("./voronoi/rhill-voronoi-core.min.js")
const {
  pointInPolygon,
  GenerateRandomPoint,
  OverlappingRects,
} = require("./assets/helpers")
const { Site } = require("./voronoi/site")
const { Building } = require("./building")

exports.District = class District {
  constructor(props) {
    this.name = props.name || props.noName ? "" : GenerateDistrictName()
    this.poly = props.poly || new Polygon([])
    this.children = []
    this.site = props.site
    this.buildings = []

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
    // Draw the polygon itself
    strokeWeight(size)
    if (this.poly.points) {
      this.poly.draw(this.col)
      let newSize = size > 1 ? size - 1 : 0
      for (let child of this.children) {
        child.draw(newSize)
      }
    }

    //Draw any buildings
    strokeWeight(2)
    fill(COLORS.dark)
    stroke(COLORS.light)
    for (let building of this.buildings) {
      rect(
        building.position[0],
        building.position[1],
        building.size[0],
        building.size[1]
      )
      ellipse(building.position[0], building.position[1], 2)
    }
  }

  findAllClicked(x, y, returnArr) {
    if (pointInPolygon(x, y, this.poly.points)) {
      returnArr.push(this)
      for (let child of this.children) {
        child.findAllClicked(x, y, returnArr)
      }
    }
  }

  generateBuildings() {
    let buildingCount = Math.round(this.poly.area()) / 1000
    let overlapTries = 100
    for (let i = 0; i < buildingCount; i++) {
      let valid = false
      let newBuilding
      let count = 0
      while (!valid && count < overlapTries) {
        count++
        let point = GenerateRandomPoint(this.poly)
        if (point.x && point.y) {
          let size = [
            Math.round(Math.random() * 8 + 16),
            Math.round(Math.random() * 8 + 16),
          ]
          newBuilding = new Building({
            type: "house",
            position: [point.x, point.y],
            size,
          })
          if (this.buildings.length == 0) {
            valid = true
          } else {
            for (let building of this.buildings) {
              valid = !OverlappingRects(
                building.getBox(),
                newBuilding.getBox(),
                5
              )
            }
          }
        }
      }
      if (newBuilding && valid) {
        this.buildings.push(newBuilding)
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
