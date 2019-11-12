import adder from "../adder.js";
import {sqrt} from "../math.js";
import noop from "../noop.js";

var lengthSum = adder(),
    lengthRing,
    x00,
    y00,
    x0,
    y0;

var lengthStream = {
  point: noop,
  lineStart() {
    lengthStream.point = lengthPointFirst;
  },
  lineEnd() {
    if (lengthRing) lengthPoint(x00, y00);
    lengthStream.point = noop;
  },
  polygonStart() {
    lengthRing = true;
  },
  polygonEnd() {
    lengthRing = null;
  },
  result() {
    var length = +lengthSum;
    lengthSum.reset();
    return length;
  }
};

function lengthPointFirst(x, y) {
  lengthStream.point = lengthPoint;
  x00 = x0 = x, y00 = y0 = y;
}

function lengthPoint(x, y) {
  x0 -= x, y0 -= y;
  lengthSum.add(sqrt(x0 * x0 + y0 * y0));
  x0 = x, y0 = y;
}

export default lengthStream;
