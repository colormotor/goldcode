/**
 * A Turtle class, adapted from 
 * https://turtletoy.net/js/turtlevm.js?v=56
 * Turtletoy is created by Reinder Nijhoff (@ReinderNijhoff).
 * The idea here is to allow a quick adaptation of examples in turtletoy to p5js.
 * In turtletoy, the main drawing procedure is executed in a `walk(i)` function that returns false when a drawing is supposed to be done, 
 * the argument `i` is set to current drawing step. So `return i < 10` will stop drawing after 10 steps.
 * A similar behavior in p5js can be done by either calling a `walk` function for a given number of steps or putting its contents in a loop.
 * Override the `turtleLine` function to create custom drawing behavior.
 */

function turtleLine(ax, ay, bx, by) {
  line(ax, ay, bx, by);
}

class Turtle {
  constructor(x, y) {
    this._x = width/2;
    this._y = height/2;
    this._h = 0;
    this._pen = false;
    this._fullCircle = 360;
    this.goto(x || width/2, y || height/2);
    this._homex = this._x;
    this._homey = this._y;
    this.pendown();
    this.store = false;
    this.polygons = [];
    this.states = [];
  }
  forward(e) {
    const x = this.x() + e * Math.cos(this._h);
    const y = this.y() + e * Math.sin(this._h);
    this.goto(x, y);
  }
  backward(e) {
    this.forward(-e);
  }
  right(e) {
    this._h += this.toradians(e);
  }
  left(e) {
    this.right(-e);
  }
  pendown() {
    if (!this._pen) {
      // new path
      if (this.store)
        this.polygons.push([[this._x, this._y]]);
    }
    this._pen = true;
  }
  penup () {
    this._pen = false;
  }
  degrees (e) {
    this._fullCircle = e ? e : 360;
  }
  radians () {
    this.degrees(Math.PI * 2);
  }
  goto (x, y) {
    if(this._pen) {
      if (this.store)
        this.polygons.push([[x, y]]);
      turtleLine(this._x, this._y, x, y);
    }
    if (Array.isArray(x)) {
      this._x = x[0];
      this._y = x[1];
    } else {
      this._x = x || 0;
      this._y = y || 0;
    }
  }
  jump(x, y) {
    if (this.x() === x && this.y() === y) {
        return;
    }
    const pen = this.isdown();
    this.penup();
    this.goto(x, y);
    if (pen) {
        this.pendown();
    }
  }
  setx (e) {
    this.goto(e, this.y());
  }
  sety (e) {
    this.goto(this.x(), e);
  }
  toradians (e) {
    return e *(Math.PI * 2 / this._fullCircle);
  }
  setheading (e) {
    this._h = this.toradians(e);
  }
  circle(radius, extent, steps) {
    if (!extent) {
        extent = this._fullCircle;
    }
    extent = this.toradians(extent);
    if (!steps) {
        steps = Math.round(Math.abs(radius * extent * 8)) | 0;
        steps = Math.max(steps, 4);
    }
    const cx = this.x() + radius * Math.cos(this._h + Math.PI / 2);
    const cy = this.y() + radius * Math.sin(this._h + Math.PI / 2);
    const a1 = Math.atan2(this.y() - cy, this.x() - cx);
    const a2 = radius >= 0 ? a1 + extent : a1 - extent;
    for (let i = 0; i < steps; i++) {
        const p = i /(steps - 1);
        const a = a1 +(a2 - a1) * p;
        const x = cx + Math.abs(radius) * Math.cos(a);
        const y = cy + Math.abs(radius) * Math.sin(a);
        this.goto(x, y);
    }
    if (radius >= 0) {
        this._h += extent;
    } else {
        this._h -= extent;
    }
  }
  home () {
    this.penup();
    this.goto(this._homex, this._homey);
    this.seth(0);
    this.pendown();
  }
  position () {
    return [this._x, this._y];
  }
  xcor() {
    return this.position()[0];
  }
  ycor() {
    return this.position()[1];
  }
  heading () {
    return this._h /(Math.PI * 2) * this._fullCircle;
  }
  isdown() {
    return this._pen;
  }
  clone() {
    const t = new Turtle(this.x(), this.y());
    t.degrees(this._fullCircle);
    t.seth(this.heading());
    return t;
  }
  push() {
    this.states.push({x: this.xcor(),
                      y: this.ycor(),
                      h: this.heading()});
  }
  pop() {
    const state = this.states.pop();
    this.jump(state.x, state.y);
    this.setheading(state.h);
  }

  fd(e) { this.forward(e); }
  bk(e) { this.backward(e); }
  back(e) { this.backward(e); }
  lt(e) { this.left(e); }
  rt(e) { this.right(e); }
  pd() { this.pendown(); }
  down () { this.pendown(); }
  pu() { this.penup(); }
  up() { this.penup(); }
  setposition(x, y) { this.goto(x, y); }
  setpos(x, y) { this.goto(x, y); }
  jmp(x, y) { this.jump(x, y); }
  seth(e) { this.setheading(e); }
  pos() { return this.position(); }
  x() { return this.xcor(); }
  y() { return this.ycor(); }
  h() { return this.heading(); }
};
