import { Vector } from "./vector";

export class CircularArray
  implements Iterable<{ point: Vector; fraction: number }>
{
  public arr: Vector[] = [];
  private lengths: number[] = [];
  private pixelLength = 0;

  constructor(public length: number) {}

  push(el: Vector) {
    if (this.arr.length > 1) {
      let nextSize = this.arr[this.arr.length - 1].distanceTo(el);
      this.pixelLength += nextSize;

      while (this.pixelLength > this.length && this.arr.length > 1) {
        this.pixelLength -= this.arr[0].distanceTo(this.arr[1]);
        this.arr.shift();
        this.lengths.shift();
      }
      this.lengths.push(nextSize);
    }

    this.arr.push(el);
  }

  pop() {
    this.arr.shift();
  }

  *[Symbol.iterator]() {
    let acc = 0;

    for (let i = 0; i < this.arr.length; i++) {
      acc += this.lengths[i];
      yield { point: this.arr[i], fraction: acc / this.length };
    }
  }
}
