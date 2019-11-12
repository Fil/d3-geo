import adder from "./adder.js";
import {cartesian, cartesianCross, cartesianNormalizeInPlace} from "./cartesian.js";
import {abs, asin, atan2, cos, epsilon, halfPi, pi, quarterPi, sign, sin, tau} from "./math.js";

const sum = adder();

function longitude(point) {
  if (abs(point[0]) <= pi)
    return point[0];
  else
    return sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
}

export default function(polygon, point) {
  const lambda = longitude(point);
  let phi = point[1];
  const sinPhi = sin(phi);
  const normal = [sin(lambda), -cos(lambda), 0];
  let angle = 0;
  let winding = 0;

  sum.reset();

  if (sinPhi === 1) phi = halfPi + epsilon;
  else if (sinPhi === -1) phi = -halfPi - epsilon;

  for (let i = 0, n = polygon.length; i < n; ++i) {
    if (!(m = (ring = polygon[i]).length)) continue;
    var ring;
    var m;
    let point0 = ring[m - 1];
    let lambda0 = longitude(point0);
    const phi0 = point0[1] / 2 + quarterPi;
    let sinPhi0 = sin(phi0);
    let cosPhi0 = cos(phi0);

    for (let j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
      var point1 = ring[j];
      var lambda1 = longitude(point1);
      const phi1 = point1[1] / 2 + quarterPi;
      var sinPhi1 = sin(phi1);
      var cosPhi1 = cos(phi1);
      const delta = lambda1 - lambda0;
      const sign = delta >= 0 ? 1 : -1;
      const absDelta = sign * delta;
      const antimeridian = absDelta > pi;
      const k = sinPhi0 * sinPhi1;

      sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
      angle += antimeridian ? delta + sign * tau : delta;

      // Are the longitudes either side of the point’s meridian (lambda),
      // and are the latitudes smaller than the parallel (phi)?
      if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
        const arc = cartesianCross(cartesian(point0), cartesian(point1));
        cartesianNormalizeInPlace(arc);
        const intersection = cartesianCross(normal, arc);
        cartesianNormalizeInPlace(intersection);
        const phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian ^ delta >= 0 ? 1 : -1;
        }
      }
    }
  }

  // First, determine whether the South pole is inside or outside:
  //
  // It is inside if:
  // * the polygon winds around it in a clockwise direction.
  // * the polygon does not (cumulatively) wind around it, but has a negative
  //   (counter-clockwise) area.
  //
  // Second, count the (signed) number of times a segment crosses a lambda
  // from the point to the South pole.  If it is zero, then the point is the
  // same side as the South pole.

  return (angle < -epsilon || angle < epsilon && sum < -epsilon) ^ (winding & 1);
}
