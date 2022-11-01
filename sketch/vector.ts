/**
 * Vector class ported to typescript from winduptoy gist
 * https://gist.github.com/winduptoy/a1aa09c3499e09edbd33
 *
 * Javascript class originaly hacked from evanw's lightgl.js
 * https://github.com/evanw/lightgl.js/blob/master/src/vector.js
 */
export class Vector {

    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    add(b: Vector) {
        return new Vector(this.x + b.x, this.y + b.y)
    }

    subtract(b: Vector) {
        return new Vector(this.x - b.x, this.y - b.y);
    }

    multiply(b: Vector|number) {
        if (b instanceof Vector) return new Vector(this.x * b.x, this.y * b.y);
        else return new Vector(this.x * b, this.y * b);
    }

    divide(b: Vector|number) {
        if (b instanceof Vector) return new Vector(this.x / b.x, this.y / b.y);
        else return new Vector(this.x / b, this.y / b);
    }

    equals(v: Vector) {
        return this.x == v.x && this.y == v.y;
    }

    dot(v: Vector) {
        return this.x * v.x + this.y * v.y;
    }

    cross(v: Vector) {
        return this.x * v.y - this.y * v.x
    }

    length() {
        return Math.sqrt(this.dot(this));
    }

    normalize() {
        return Vector.fromAngle(this.toAngles())
        // return this.divide(this.length());
    }

    toAngles() {
        return -Math.atan2(-this.y, this.x);
    }

    angleTo(a: Vector) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    limit(length: number) {
        if (this.length() > length) {
            return this.normalize().multiply(length)
        } else {
            return this
        }
    }

    distanceTo(a: Vector) {
        return Math.hypot(this.x - a.x, this.y - a.y)
    }

    /* STATIC METHODS */

    static negative(a: Vector) {
        return new Vector(-a.x, -a.y);
    }

    static add(a: Vector, b: Vector|number) {
        if (b instanceof Vector) return new Vector(a.x + b.x, a.y + b.y);
        else return new Vector(a.x + b, a.y + b);
    }

    static subtract(a: Vector, b: Vector|number) {
        if (b instanceof Vector) return new Vector(a.x - b.x, a.y - b.y);
        else return new Vector(a.x - b, a.y - b);
    }

    static multiply(a: Vector, b: Vector|number) {
        if (b instanceof Vector) return new Vector(a.x * b.x, a.y * b.y);
        else return new Vector(a.x * b, a.y * b);
    }

    static divide(a: Vector, b: Vector|number) {
        if (b instanceof Vector) return new Vector(a.x / b.x, a.y / b.y);
        else return new Vector(a.x / b, a.y / b);
    }

    static equals(a: Vector, b: Vector) {
        return a.x == b.x && a.y == b.y;
    }

    static dot(a: Vector, b: Vector) {
        return a.x * b.x + a.y * b.y;
    }

    static cross(a: Vector, b: Vector) {
        return a.x * b.y - a.y * b.x;
    }

    static fromAngle(radians: number) {
        return new Vector(Math.cos(radians), Math.sin(radians))
    }

}