function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

function download(content, fileName, contentType) {
  var a = document.createElement("a")
  var file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}

function indexFromXY(x, y) {
  return grid_width * x + y
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max)
}

function sortPointsClockwise(points) {
  let non_dupe_points = removeDupes(points)

  const center = non_dupe_points.reduce(
    (acc, { x, y }) => {
      acc.x += x / non_dupe_points.length
      acc.y += y / non_dupe_points.length
      return acc
    },
    { x: 0, y: 0 }
  )
  const angles = non_dupe_points.map(({ x, y }) => {
    return {
      x,
      y,
      angle: (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI,
    }
  })

  const pointsSorted = angles.sort((a, b) => a.angle - b.angle)

  for (let point of pointsSorted) {
    delete point.angle
  }

  return pointsSorted
}

function removeDupes(input_array) {
  let unique_array = []
  input_array.forEach((input_element) => {
    if (
      !unique_array.some(
        (unique_element) =>
          unique_element.x === input_element.x &&
          unique_element.y === input_element.y
      )
    ) {
      unique_array.push(input_element)
    }
  })
  return unique_array
}

function distanceBetween(x1, y1, x2, y2) {
  var a = x1 - x2
  var b = y1 - y2

  return Math.sqrt(a * a + b * b)
}

function pointInPolygon(x, y, poly) {
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
