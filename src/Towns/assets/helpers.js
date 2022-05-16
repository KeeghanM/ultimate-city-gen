exports.removeClosest = function removeClosest(x, y, arr, threshold) {
  let distance = Infinity
  let closest = undefined
  for (let item of arr) {
    let curDist = distanceBetween(x, y, item.x, item.y)
    if (curDist < distance) {
      distance = curDist
      closest = item
    }
  }
  if (closest && distance < threshold) {
    let index = arr.indexOf(closest)
    arr.splice(index, 1)
  }
}

exports.pointInPolygon = function pointInPolygon(x, y, poly) {
  var inside = false
  for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    var xi = poly[i].x,
      yi = poly[i].y
    var xj = poly[j].x,
      yj = poly[j].y

    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}

exports.setMode = function setMode(md) {
  mode = md
  for (let btn of btnList) {
    btn.removeClass("active")
    if (btn.id() === "btn-" + md) btn.addClass("active")
  }
  // if (md == "detail") {
  //   detailPane.show()
  // } else {
  //   detailPane.hide()
  // }
}

exports.toggle = function toggle(elem) {
  if (elem.elt.attributes.style.value.includes("display: none;")) {
    elem.show()
  } else {
    elem.hide()
  }
}

exports.distanceBetween = function distanceBetween(x1, y1, x2, y2) {
  var a = x1 - x2
  var b = y1 - y2

  return Math.sqrt(a * a + b * b)
}

exports.clockwiseOrder = function clockwiseOrder(points) {
  const center = points.reduce(
    (acc, { x, y }) => {
      acc.x += x / points.length
      acc.y += y / points.length
      return acc
    },
    { x: 0, y: 0 }
  )

  // Add an angle property to each point using tan(angle) = y/x
  const angles = points.map(({ x, y }) => {
    return {
      x,
      y,
      angle: (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI,
    }
  })

  // Sort your points by angle
  const pointsSorted = angles.sort((a, b) => a.angle - b.angle)

  return pointsSorted
}

exports.GenerateRandomPoint = function GenerateRandomPoint(poly) {
  let bbox = poly.boundingBox()
  let pointInPoly = false
  let x, y
  let maxTries = 100
  let count = 0
  while (!pointInPoly && count < maxTries) {
    count++
    x = bbox.xl + Math.random() * (bbox.xr - bbox.xl)
    y = bbox.yt + Math.random() * (bbox.yb - bbox.yt)
    pointInPoly = pointInPolygon(x, y, poly)
  }

  return { x, y }
}
