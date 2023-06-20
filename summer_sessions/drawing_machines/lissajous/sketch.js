/**
 * Example showing a Lissajous curve
 */

var axi;
var plotButton;

var t = 0;
var steps = 50;
var x, y;
let A = 1;

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
  createCanvas(500, 500);
  strokeWeight(2);
  stroke(0);
  noFill();
  background(220);
  let n = 1200;
  delta = TWO_PI/4;
  let a = 7.0, b = 10.0;
  let dt = TWO_PI / n;
  axi.beginShape(); 

  for (let i = 0; i < n; i++) {
    x = sin(cos(t*(1+A))*a + delta);
    y = sin(sin(t*(2+A))*b);
    axi.vertex(width/2 + x*200*A, height/2 + y*200*A); //, 1);

    //A = sin(t*0.5); 
    t += dt;
  }
  axi.endShape();

  button = createButton('plot');
  button.mousePressed(axi.plot);
}

function draw() {
}

