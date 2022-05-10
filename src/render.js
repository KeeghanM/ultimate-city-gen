const { p5 } = require("p5")
const { town } = require("./Towns/Town")
const COLORS = {
  dark: "#333",
  light: "#999",
  primary: "#F4A259",
  accent: "#5B8E7D",
  danger: "#BC4B51",
  success: "#8CB369",
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  background(COLORS.dark)
  noStroke()
}

function draw() {
  background(COLORS.dark)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}
