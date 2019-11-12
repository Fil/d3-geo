import length from "./length.js";

const coordinates = [null, null], object = {type: "LineString", coordinates};

export default function(a, b) {
  coordinates[0] = a;
  coordinates[1] = b;
  return length(object);
}
