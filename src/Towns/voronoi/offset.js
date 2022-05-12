var mod = function (x, m) {
  return ((x % m) + m) % m
}

function Vector2(x, y) {
  this.x = x
  this.X = x
  this.y = y
  this.Y = y
}
Vector2.prototype.add = function (other) {
  return new Vector2(this.x + other.x, this.y + other.y)
}
Vector2.prototype.subtract = function (other) {
  return new Vector2(this.x - other.x, this.y - other.y)
}
Vector2.prototype.scale = function (scalar) {
  return new Vector2(this.x * scalar, this.y * scalar)
}
Vector2.prototype.normalized = function () {
  var magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
  return new Vector2(this.x / magnitude, this.y / magnitude)
}
Vector2.prototype.dot = function (other) {
  return this.x * other.x + this.y * other.y
}
Vector2.prototype.cross = function (other) {
  return this.x * other.y + this.y * other.x
}
Vector2.prototype.vector2Args = function (x, y) {
  x = x || 0
  y = y || 0
  return [this.x + x, this.y + y]
}

function Line(startingPoint, endingPoint) {
  this.startingPoint = startingPoint
  this.endingPoint = endingPoint
}
Line.prototype.midpoint = function () {
  return this.startingPoint.add(this.endingPoint).scale(0.5)
}
Line.prototype.direction = function () {
  return this.endingPoint.subtract(this.startingPoint).normalized()
}
Line.prototype.offsetted = function (dir, offset) {
  var pointOffset = dir.scale(offset)

  var pt1 = this.startingPoint.add(pointOffset)
  var pt2 = this.endingPoint.add(pointOffset)

  return new Line(pt1, pt2)
}

function intersectionBetween(line1, line2) {
  // Returns the intersection point if there is one, otherwise false
  // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line

  var denom =
    (line1.startingPoint.x - line1.endingPoint.x) *
      (line2.startingPoint.y - line2.endingPoint.y) -
    (line1.startingPoint.y - line1.endingPoint.y) *
      (line2.startingPoint.x - line2.endingPoint.x)
  var isParallel = denom === 0
  if (!isParallel) {
    var numeratorX =
      (line1.startingPoint.x * line1.endingPoint.y -
        line1.startingPoint.y * line1.endingPoint.x) *
        (line2.startingPoint.x - line2.endingPoint.x) -
      (line2.startingPoint.x * line2.endingPoint.y -
        line2.startingPoint.y * line2.endingPoint.x) *
        (line1.startingPoint.x - line1.endingPoint.x)
    var numeratorY =
      (line1.startingPoint.x * line1.endingPoint.y -
        line1.startingPoint.y * line1.endingPoint.x) *
        (line2.startingPoint.y - line2.endingPoint.y) -
      (line2.startingPoint.x * line2.endingPoint.y -
        line2.startingPoint.y * line2.endingPoint.x) *
        (line1.startingPoint.y - line1.endingPoint.y)

    return new Vector2(numeratorX / denom, numeratorY / denom)
  }

  return false
}

/* */
function getIntersectionBetweenSegments(line1, line2) {
  // From: http://stackoverflow.com/a/1968345/796832

  var s1_x = line1.endingPoint.x - line1.startingPoint.x
  var s1_y = line1.endingPoint.y - line1.startingPoint.y
  var s2_x = line2.endingPoint.x - line2.startingPoint.x
  var s2_y = line2.endingPoint.y - line2.startingPoint.y

  var t =
    (s2_x * (line1.startingPoint.y - line2.startingPoint.y) -
      s2_y * (line1.startingPoint.x - line2.startingPoint.x)) /
    (-s2_x * s1_y + s1_x * s2_y)
  var u =
    (-s1_y * (line1.startingPoint.x - line2.startingPoint.x) +
      s1_x * (line1.startingPoint.y - line2.startingPoint.y)) /
    (-s2_x * s1_y + s1_x * s2_y)

  // If t, u is exactly 0 or 1 the lines touch at an end-point.
  // You can consider this an "intersection" or not as you see fit.
  if (u > 0 && u < 1 && t > 0 && t < 1) {
    // Collision detected
    var i_x = line1.startingPoint.x + t * s1_x
    var i_y = line1.startingPoint.y + t * s1_y
    return {
      intersection: new Vector2(i_x, i_y),
      t: t, // line1 percentage travel
      u: u, // line2 percentage travel
    }
  }

  return false // No collision
}

exports.OffsetPath = function offsetPath(point_list_nonV, offset) {
  var offseted_poly_path = []
  let point_list = []
  for (let p of point_list_nonV) {
    point_list.push(new Vector2(p.x, p.y))
  }
  // Make sure there are points in the list
  if (point_list && point_list.length > 0) {
    // Initialize the first previous offset line
    var previous_line = new Line(
      point_list[mod(-1, point_list.length)],
      point_list[mod(0, point_list.length)]
    )
    var previous_dir = previous_line.direction()
    var previous_normal_dir = new Vector2(previous_dir.y, -previous_dir.x)
    var previous_offsetted_line = previous_line.offsetted(
      previous_normal_dir,
      offset
    )

    // Loop through all of the points in the polygon and get the offset for each
    point_list.forEach(function (point, index, array) {
      var next_point = array[mod(index + 1, array.length)]

      // Create the current line
      var line = new Line(point, next_point)

      var dir = line.direction()
      // Get the direction pointing away from the line (90 degrees away)
      var normal_dir = new Vector2(dir.y, -dir.x)
      // Offset each endpoint of the line outwards in the normal direction
      var offsetted_line = line.offsetted(normal_dir, offset)

      // Find the intersection between the previous offset line and the current
      offseted_poly_path.push(
        intersectionBetween(previous_offsetted_line, offsetted_line)
      )

      // Get ready for the next iteration
      previous_offsetted_line = offsetted_line
    })
  }

  // This is an "optional" step that will get rid of the nasties
  // such as intersections that fold over each other
  // `checkForIntersection` currently does not work correctly
  //var offset_shapes = checkForIntersection(point_list, offseted_poly_path);
  var offset_shapes = [offseted_poly_path]

  // Returns [[array of points], [array of points], ...]
  // Most of the time it will probably only return one array of points in the array
  // except on the edge cases where there are intersections and folding on itself
  return offset_shapes
}
