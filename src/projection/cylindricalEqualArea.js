import {asin, cos, sin} from "../math.js";

export function cylindricalEqualAreaRaw(phi0) {
  const cosPhi0 = cos(phi0);

  function forward(lambda, phi) {
    return [lambda * cosPhi0, sin(phi) / cosPhi0];
  }

  forward.invert = (x, y) => [x / cosPhi0, asin(y * cosPhi0)];

  return forward;
}
