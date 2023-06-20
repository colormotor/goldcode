
/**
 * Example showing push/pop and transformations
 */

var axi;
var plotButton;

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
  background(128);
  axi.translate(width/2, height/2);
  let n = 50;
  for (let i = 0; i < n; i++) {
    axi.push();
    axi.rotate(2*i*PI/n);
    axi.beginShape(); 
    axi.vertex(10, 10);
    axi.vertex(100, 10);
    axi.vertex(100, 100);
    axi.endShape(CLOSE);
    axi.circle(200, 0, 100);
    axi.pop();
  }

  button = createButton('plot');
  button.mousePressed(axi.plot);
}

function draw() {
}

