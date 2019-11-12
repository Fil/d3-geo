import {degrees, pi, radians} from "../math.js";
import {projectionMutator} from "./index.js";

export function conicProjection(projectAt) {
  let phi0 = 0;
  let phi1 = pi / 3;
  const m = projectionMutator(projectAt);
  const p = m(phi0, phi1);

  p.parallels = function(_) {
    return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
  };

  return p;
}
