
/**
 * Turtle example
 */

var axi;
var plotButton;

function preload() {
  // Here we setup the axidraw client connection
  let address = 'ws://c924-158-223-165-74.ngrok-free.app'
  //let address = 'ws://10.100.10.201:9999'
  axi = new AxiDrawClient(address);
}

function plot() {
  axi.plot("Hello");
}

function setup() {
  createCanvas(500, 400);
  strokeWeight(2);
  stroke(0);
  noFill();
  background(222);

  turtle = new Turtle();
  for (var i = 0; i < 36; i++) {
    turtle.right(10)
    turtle.circle(90, 360, steps=11);
  }

  axi.addPolygons(turtle.polygons);

  button = createButton('plot');
  button.mousePressed(plot);
}

function draw() {
}

