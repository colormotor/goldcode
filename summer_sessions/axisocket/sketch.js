
var axi;

function preload() {
  axi = new AxiDrawClient('ws://127.0.0.1:4000');
}

function setup() {
  createCanvas(400, 400);
  
  stroke(0);
  background(255);
  axi.beginShape();
  axi.vertex(10, 10);
  axi.vertex(100, 10);
  axi.vertex(100, 100);
  axi.endShape(CLOSE);

  axi.circle(width/2, height/2, 100);
  //axi.plot();
}

function draw() {
}

