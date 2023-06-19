AxiDrawClient = function(address) {
  /// Simple socket intereface for controlling AxiDraw remotely
  this.stack = new TransformStack2d();
  this.debug = true;
  this.connected = false;

  this.socket = io(address); // Replace <server-ip> with the IP address or hostname of the server

  this.socket.on('connect', () => {
    console.log('WebSocket connection established');
    // Send a message to the server
    this.socket.emit('message', 'Hello from client!');
    this.connected = true;
});

  // this.socket = new WebSocket(address);
  
  // this.socket.onopen = () => {
  //   console.log('WebSocket connection established.');
  //   this.connected = true;
  // };
  

  // Block until 
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
    p = this.stack.transform([x, y]);
    this.lastpath().push(p);
    if (this.debug)
      vertex(x, y);
    else
      vertex(p[0], p[1]); 
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

  this.ellipse = (x, y, w, h, subd=50) => {
    this.beginShape();
    let dtheta = 2*Math.PI/(subd);
    for (let i = 0; i < subd; i++) {
      this.vertex(x + Math.cos(dtheta*i)*w/2,
                  y + Math.sin(dtheta*i)*w/2);
    }
    this.endShape(CLOSE);
  }

  this.circle = (x, y, diameter) => {
    this.ellipse(x, y, diameter, diameter);
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
    //this.socket.send("PATHCMD stroke " + P.length + cmd); 
    this.socket.emit("message", "PATHCMD stroke " + P.length + cmd); 
  }

  this.plot = (title=undefined) => {
    print("Plotting");
    if (!this.connected){
      print("Not connected");
      return;
    }
    print("Sending");
    if (title)
      this.socket.send("PATHCMD title " + title);
    this.socket.send("PATHCMD drawing_start");
    for (let P of this.paths){
      this.sendPath(P);
      this.socket.send("PATHCMD drawing_end");
    }
  }

  this.rotate = (theta) => {
    this.stack.rotate(theta);
    if (this.debug)
      rotate(theta);
  }

  this.translate = (x, y) => {
    this.stack.translate(x, y);
    if (this.debug)
      translate(x, y);
  }

  this.scale = (x, y=undefined) => {
    this.stack.scale(x ,y);
    if (this.debug)
      if (y==undefined)
        scale(x);
      else
        scale(x,y);
  }

  this.push = () => {
    this.stack.push();
    if (this.debug)
      push();
  }

  this.pop = () => {
    this.stack.pop();
    if (this.debug)
      pop();
  }

}

function eye_2d() {
  return [[1.0, 0.0, 0.0], 
          [0.0, 1.0, 0.0],
          [0.0, 0.0, 1.0]];
}

function rot_2d(theta) {
  let m = eye_2d();
  let ct = Math.cos(theta)
  let st = Math.sin(theta)
  m[0][0] = ct; m[0][1] = -st;
  m[1][0] = st; m[1][1] = ct;
  return m;
}

function trans_2d(x, y) {
  let m = eye_2d();
  m[0][2] = x;
  m[1][2] = y;
  return m
}

function scaling_2d(x, y) {
  let m = eye_2d()
  m[0][0] = x;
  m[1][1] = y;
  return m
}

function rot(theta) {
  let m = eye();
  let ct = Math.cos(theta)
  let st = Math.sin(theta)
  m[0][0] = ct; m[0][1] = -st;
  m[1][0] = st; m[1][1] = ct;
  return m;
}

function mul33(a, b) {
  const result = eye_2d();

  for (let i = 0; i < a.length; i++) {
    //result[i] = [];
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < a[0].length; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

function transform(mat, p) {
  const x = mat[0][0] * p[0] + mat[0][1] * p[1] + mat[0][2];
  const y = mat[1][0] * p[0] + mat[1][1] * p[1] + mat[1][2];
  return [x, y];
}

TransformStack2d = function() {
  this.transforms = [eye_2d()];
  this.dirty = false;
  
  this.push = function (m=undefined) {
    if (m==undefined)
      m = eye_2d();
    this.dirty = true;
    this.transforms.push(mul33(this.top(), m));
  };

  this.rotate = function (theta) {
    this.dirty = true;
    this.transforms[this.transforms.length - 1] = mul33(this.transforms[this.transforms.length - 1],
                                                        rot_2d(theta));
  }

  this.translate = function (x, y) {
    this.dirty = true;
    this.transforms[this.transforms.length - 1] = mul33(this.transforms[this.transforms.length - 1],
                                                        trans_2d(x, y));
  }

  this.scale = function (x, y=undefined) {
    this.dirty = true;
    if (y==undefined) {
      y = x;
    }
    this.transforms[this.transforms.length - 1] = mul33(this.transforms[this.transforms.length - 1],
                                                        scaling_2d(x, y));
  }

  this.pop = function () {
    if (this.transforms.length < 2) {
      throw new Error("Stack is empty");
    }

    return this.transforms.pop();
  };

  this.top = function () {
    if (this.transforms.length === 0) {
      throw new Error("Stack is empty");
    }

    return this.transforms[this.transforms.length - 1];
  };

  this.transform = function(p) {
    if (!this.dirty)
      return p;
    return transform(this.top(), p);
  }
}


