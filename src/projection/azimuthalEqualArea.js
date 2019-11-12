import {asin, sqrt} from "../math.js";
import {azimuthalRaw, azimuthalInvert} from "./azimuthal.js";
import projection from "./index.js";

export const azimuthalEqualAreaRaw = azimuthalRaw(cxcy => sqrt(2 / (1 + cxcy)));

azimuthalEqualAreaRaw.invert = azimuthalInvert(z => 2 * asin(z / 2));

export default function() {
  return projection(azimuthalEqualAreaRaw)
      .scale(124.75)
      .clipAngle(180 - 1e-3);
}
