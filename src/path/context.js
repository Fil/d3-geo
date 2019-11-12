import {tau} from "../math.js";
import noop from "../noop.js";

export default function PathContext(context) {
  this._context = context;
}

PathContext.prototype = {
  _radius: 4.5,
  pointRadius(_) {
    return this._radius = _, this;
  },
  polygonStart() {
    this._line = 0;
  },
  polygonEnd() {
    this._line = NaN;
  },
  lineStart() {
    this._point = 0;
  },
  lineEnd() {
    if (this._line === 0) this._context.closePath();
    this._point = NaN;
  },
  point(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, tau);
        break;
      }
    }
  },
  result: noop
};
