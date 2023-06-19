AxiDrawClient = function(address) {
  /// Simple socket intereface for controlling AxiDraw remotely
  this.socket = undefined; //new WebSocket(address);
  this.connected = false;
  this.socket.onopen = () => {
    console.log('WebSocket connection established.');
    this.connected = true;
  };
  
  this.paths = [];
  
  this.clear = () => { this.paths = []; }
  
  this.lastpath = () => {
    if (this.paths.length)
      return this.paths[this.paths.length-1];
    return undefined;
  }
  
  this.isLastEmpty = () => {
    if (!this.paths.length)
      return true;
    this.paths[this.paths.length-1].length==0;
  }
  
  this.beginShape = () => {
    if (this.isLastEmpty())
      this.paths.push([]);
    beginShape();
  }
  
  this.vertex = (x, y) => {
    this.lastpath().push([x, y]);
    vertex(x, y);
  }
  
  this.endShape = (close=0) => {
    endShape(close);
  }

  this.rectangle = (x, y, w, h) => {
    this.beginShape();
    this.vertex(x, y);
    this.vertex(x+w, y);
    this.vertex(x+w, y+h);
    this.vertex(x, y+h);
    this.endShape(CLOSE);
  }

  this.ellipse = (x, y, w, h, subd=100) => {
    this.beginShape();
    let dtheta = 2*Math.PI/subd;
    for (let i = 0; i < subd; i++) {
      this.vertex(x + Math.cos(dtheta*i)*w/2,
                  y + Math.sin(dtheta*i)*w/2);
    }
    this.endShape(CLOSE);
  }

  this.line = (x1, y1, x2, y2) => {
    this.beginShape();
    this.vertex(x1, y1);
    this.vertex(x2, y2);
    this.endShape();
  }

  this.sendPath = (P) => {
    let cmd = "";
    for (let xy of P) {
      cmd += " " + xy[0] + " " + xy[1];
    }
    this.socket.send("PATHCMD stroke " + P.length + cmd); 
  }

  this.plot = (title=undefined) => {
    if (!this.connected){
      print("Not connected");
      return;
    }

    if (title)
      this.socket.send("PATHCMD title " + title);
    this.socket.send("PATHCMD drawing_start");
    for (let P of this.paths){
      this.sendPath(P);
      this.socket.send("PATHCMD drawing_end");
    }
  }
}
