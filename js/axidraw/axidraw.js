AxiDrawClient = function(address) {
  /// Simple socket intereface for controlling AxiDraw remotely
  this.stack = new TransformStack2d();
  this.debug = false; // does not work with hatch
  this.connected = false;
  this.useio = false; // io needs some setup that is currently not working
  if (this.useio) {
    this.socket = io(address, { cors: true }); // Replace <server-ip> with the IP address or hostname of the server

    this.socket.on('connect', () => {
      console.log('WebSocket connection established');
      // Send a message to the server
      this.connected = true;
    });
  } else {
    this.socket = new WebSocket(address);
    
    this.socket.onopen = () => {
      console.log('WebSocket connection established.');
      this.connected = true;
    };  
  }

  this.paths = [];
  this.hatchPaths = [];
  this.hatchParams = {dist:10, angle:0, active:false};

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
    this.paths.push([]);
    beginShape();
  }
  
  this.vertex = (x, y, applyTransform=true) => {
    if (applyTransform)
      p = this.stack.transform([x, y]);
    else
      p = [x, y];
    this.lastpath().push([p[0], p[1]]);
    if (this.debug)
      vertex(x, y);
    else
      vertex(p[0], p[1]); // + Math.random()*10, p[1] + Math.random()*10); 
  }
  
  this.addPolygons = (paths) => {
    for (let P of paths) {
      this.beginShape();
      for (let p of P)
        this.vertex(p[0], p[1]);
      this.endShape();
    }
  }

  this.endShape = (close=0) => {

    endShape(close);
    let P = clonePoly(this.lastpath());
    // Add path before closing
    if (this.hatchParams.active) {
      this.hatchPaths.push(P);
    }
    // Close actual polygon
    if (close==CLOSE) {
      let p = P[0];
      this.vertex(p[0], p[1], false);
    }  

    
  }

  this.beginHatch = (dist, angle=0) => {
    this.hatchParams.dist = dist;
    this.hatchParams.angle = angle;
    this.hatchParams.active = true;
    this.hatchPaths = [];
  }

  this.endHatch = () => {
    if (this.hatchPaths.length) {
      let hatches = hatch(this.hatchPaths, this.hatchParams.dist, this.hatchParams.angle);
      for (let h of hatches) {
        this.paths.push(clonePoly(h));
        line(h[0][0], h[0][1], h[1][0], h[1][1]);
      }
    }
    this.hatchPaths = [];
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

  this.circle = (x, y, diameter, subd=50) => {
    this.ellipse(x, y, diameter, diameter, subd);
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
    if (this.useio) {
      // print("PATHCMD stroke " + P.length + cmd);
      this.socket.emit("message", "PATHCMD stroke " + P.length + cmd); 
    }else{
      //print("PATHCMD stroke " + P.length + cmd);
      this.socket.send("PATHCMD stroke " + P.length + cmd); 
    }
  }

  this.plot = (title=undefined) => {
    print("Plotting");
    if (!this.connected){
      print("Not connected");
      return;
    }
    print("Sending");
    // if (title)
    //   this.socket.send("PATHCMD title " + title);
    this.socket.send("PATHCMD drawing_start");
    for (let P of this.paths){
      if (P.length < 2)
        continue;
      this.sendPath(P);
    }
    this.socket.send("PATHCMD drawing_end");
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

function transpose33(mat) {
  let transposed = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      transposed[j][i] = mat[i][j];
    }
  }
  return transposed;
}
  
function transform(mat, p) {
  const x = mat[0][0] * p[0] + mat[0][1] * p[1] + mat[0][2];
  const y = mat[1][0] * p[0] + mat[1][1] * p[1] + mat[1][2];
  return [x, y];
}

function boundingBox(S, padding = 0) {
  /// Axis ligned bounding box of one or more contours (any dimension)
  // Returns [min,max] list'''
  if (!S.length)
    return [[0, 0], [0, 0]];

  var xmin = Infinity; 
  var ymin = Infinity;
  var xmax = -Infinity;
  var ymax = -Infinity;
  
  for (let P of S) {
    for (let p of P) {
      xmin = Math.min(p[0], xmin);
      ymin = Math.min(p[1], ymin);
      xmax = Math.max(p[0], xmax);
      ymax = Math.max(p[1], ymax);
    }
  }

  return [[xmin, ymin], [xmax, ymax]];
}

const clonePoly = (P) => {
  return P.map(p => [p[0], p[1]]);
}

const compare_nums = (a, b) => {
  return a - b;
}

/**
 * Computes hatch (scan)lines for a polygon or a compound shape according to the even-odd fill rule
 * @param {Array} polygon or shape
 * @param {Number} dist distance between scanlines
 * @param {Number} theta scanline orientation (radians)
 * @param {bool} flip_horizontal if true, flip odd scanline orientation
 * @param {any} max_count maximum number of scanlines 
 * @param {any} eps tolerance for zero distance
 * @returns an array of coordinate pairs one pair for each scanline
 */
function hatch(S, dist, theta=0.0, flip_horizontal=true, max_count=10000, eps=1e-10) {
  if (!S.length)
    return [];

  // Rotate shape for oriented hatches
  // const theta = radians(angle);
  // stroke(255, 0, 0);
  
  // for (let P of S) {
  //   beginShape();
  //   for (let p of P) {
  //     vertex(p[0], p[1]);
  //   }
  //   endShape(CLOSE);
  // }
  // endShape(CLOSE);

  let mat = rot_2d(-theta);
  S = S.map( P => P.map( p => transform(mat, p)));
  const box = boundingBox(S);

  // build edge table
  let ET = [];
  for (let i = 0; i < S.length; i++){
    const P = S[i];
    const n = P.length;
    if (n <= 2)
      continue;

    let dx, dy, m;
    for (let j = 0; j < n; j++){
      let [a, b] = [P[j], P[(j+1)%n]];
      // reorder increasing y
      if (a[1] > b[1])
        [a, b] = [b, a];
      // slope
      dx = (b[0] - a[0]);
      dy = (b[1] - a[1]);
      if (Math.abs(dx) > eps)
        m = dy/dx;
      else
        m = 1e15;
      if (Math.abs(m) < eps)
        m = null;
      ET.push({a:a, b:b, m:m, i:i});
    }
  }
  // sort by increasing y of first point
  ET.sort((ea, eb)=>compare_nums(ea.a[1], eb.a[1]));

  // intersection x
  const ex = (e, y) => {
    if (e.m == null)
      return null;
    return (e.a[0] + (y - e.a[1])/e.m);
  };

  let y = box[0][1];
  let scanlines = [];
  let AET = []; // active edge table
  let flip = 0;
  let c = 0;
  while (ET.length || AET.length){
    if (y > box[1][1])
      break;
    if (c >= max_count){
      console.log("scanlines: reached max number of iterations: " + c);
      break;
    }
    c += 1;

    // move from ET to AET
    let i = 0;
    for (const e of ET){
      if (e.a[1] <= y){
        AET.push(e);
        i += 1;
      }else{
        break;
      }
    }

    if (i < ET.length)
      ET = ET.slice(i);
    else
      ET = [];

    // remove passed edges
    AET.sort((ea, eb)=>compare_nums(ea.b[1], eb.b[1])); //  = sorted(AET, key=lambda e: e.b[1])
    AET = AET.filter(e=>e.b[1] > y);
    let xs = AET.map(e=>[ex(e, y), e.i]);
    xs = xs.filter(xi=>xi[0] != null);
    // sort xs (flipped each scanline for more efficent plotting )
    if (flip)
      xs.sort((va, vb)=>compare_nums(-va[0], -vb[0])); // = sorted(xs, key=lambda v: -v[0])
    else
      xs.sort((va, vb)=>compare_nums(va[0], vb[0]));

    if (flip_horizontal)
      flip = !flip;

    if (xs.length > 1){
      let parity = 1; // assume even-odd fill rule
      let x1,i1,x2,i2;
      for (let k = 0; k < xs.length-1; k++){
        [x1, i1] = xs[k];
        [x2, i2] = xs[k+1];
        let pa = [x1, y];
        let pb = [x2, y];

        if (parity){
          scanlines = scanlines.concat([pa,pb]);
        }

        parity = !parity;
      }
    }

    // increment
    y += dist;
  }

  result = [];
  // unrotate

  if (scanlines.length){
    var unmat = transpose33(mat);
    scanlines = scanlines.map( p => transform(unmat, p) );    
    for (let i = 0; i < scanlines.length; i += 2) {
      result.push([scanlines[i], scanlines[i+1]]);
    }
  }
  // print(result[4][0])

  return result;
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
    this.transforms[this.transforms.length - 1] = mul33(this.transforms[this.transforms.length - 1],                                         trans_2d(x, y));
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
    // if (!this.dirty)
    //   return p;
    return transform(this.top(), p);
  }
}


