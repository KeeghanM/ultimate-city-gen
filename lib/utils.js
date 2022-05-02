export function handleError(err) {
  alert(err.message)
}

export function toFeet(n) {
  var realFeet = (n * 0.3937) / 12
  var feet = Math.floor(realFeet)
  var inches = Math.round((realFeet - feet) * 12)
  return feet + "'" + inches + '"'
}

export function weightedRandom(min, max) {
  return Math.round(max / (Math.random() * max + min))
}
