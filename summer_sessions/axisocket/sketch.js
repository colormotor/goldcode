
var axi;
var plotButton;

async function preload() {
  axi = new AxiDrawClient('ws://127.0.0.1:4000');
}

function setup() {
  createCanvas(500, 400);
  strokeWeight(2);
  stroke(0);
  noFill();
  background(128);
  axi.translate(width/2, height/2);
  for (let i = 0; i < 40; i++) {
    axi.push();
    axi.rotate(i*0.2);
    axi.beginShape(); 
    axi.vertex(10, 10);
    axi.vertex(100, 10);
    axi.vertex(100, 100);
    axi.endShape(CLOSE);

    axi.circle(width/2, height/2, 100);
    axi.pop();
  }

  button = createButton('plot');
  button.mousePressed(axi.plot);
}

function draw() {
}

