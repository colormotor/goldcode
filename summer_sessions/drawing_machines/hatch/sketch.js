/**
 * Example showing hatch filling
 */

var axi;
var plotButton;

function preload() {
  // Here we setup the axidraw client connection
  let address = 'ws://471f-2a02-c7c-3891-7c00-a899-98ae-6d93-5334.ngrok-free.app'
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
  background(220);
  axi.translate(width/2, height/2);
  // Commands between beginHatch and endHatch will be filled with lines
  // first parameter is distance, second is angle in radians
  axi.beginHatch(10, 0); 
  axi.rectangle(-100, -100, 200, 200);
  axi.circle(0, 0, 100, 35); 
  // "nesting" shapes between beginHatch and endHatch pairs
  // will produce fills as for the "even-odd" rule
  axi.endHatch();

  button = createButton('plot');
  button.mousePressed(axi.plot);
}

function draw() {
}

