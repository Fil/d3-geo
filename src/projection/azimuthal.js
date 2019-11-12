import {asin, atan2, cos, sin, sqrt} from "../math.js";

export function azimuthalRaw(scale) {
  return (x, y) => {
    var cx = cos(x),
        cy = cos(y),
        k = scale(cx * cy);
    return [
      k * cy * sin(x),
      k * sin(y)
    ];
  };
}

export function azimuthalInvert(angle) {
  return (x, y) => {
    var z = sqrt(x * x + y * y),
        c = angle(z),
        sc = sin(c),
        cc = cos(c);
    return [
      atan2(x * sc, z * cc),
      asin(z && y * sc / z)
    ];
  };
}
