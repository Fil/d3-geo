import {default as polygonContains} from "./polygonContains.js";
import {default as distance} from "./distance.js";
import {epsilon2, radians} from "./math.js";

const containsObjectType = {
  Feature({geometry}, point) {
    return containsGeometry(geometry, point);
  },
  FeatureCollection(object, point) {
    const features = object.features;
    let i = -1;
    const n = features.length;
    while (++i < n) if (containsGeometry(features[i].geometry, point)) return true;
    return false;
  }
};

const containsGeometryType = {
  Sphere() {
    return true;
  },
  Point({coordinates}, point) {
    return containsPoint(coordinates, point);
  },
  MultiPoint(object, point) {
    const coordinates = object.coordinates;
    let i = -1;
    const n = coordinates.length;
    while (++i < n) if (containsPoint(coordinates[i], point)) return true;
    return false;
  },
  LineString({coordinates}, point) {
    return containsLine(coordinates, point);
  },
  MultiLineString(object, point) {
    const coordinates = object.coordinates;
    let i = -1;
    const n = coordinates.length;
    while (++i < n) if (containsLine(coordinates[i], point)) return true;
    return false;
  },
  Polygon({coordinates}, point) {
    return containsPolygon(coordinates, point);
  },
  MultiPolygon(object, point) {
    const coordinates = object.coordinates;
    let i = -1;
    const n = coordinates.length;
    while (++i < n) if (containsPolygon(coordinates[i], point)) return true;
    return false;
  },
  GeometryCollection(object, point) {
    const geometries = object.geometries;
    let i = -1;
    const n = geometries.length;
    while (++i < n) if (containsGeometry(geometries[i], point)) return true;
    return false;
  }
};

function containsGeometry(geometry, point) {
  return geometry && containsGeometryType.hasOwnProperty(geometry.type)
      ? containsGeometryType[geometry.type](geometry, point)
      : false;
}

function containsPoint(coordinates, point) {
  return distance(coordinates, point) === 0;
}

function containsLine(coordinates, point) {
  let ao, bo, ab;
  for (let i = 0, n = coordinates.length; i < n; i++) {
    bo = distance(coordinates[i], point);
    if (bo === 0) return true;
    if (i > 0) {
      ab = distance(coordinates[i], coordinates[i - 1]);
      if (
        ab > 0 &&
        ao <= ab &&
        bo <= ab &&
        (ao + bo - ab) * (1 - Math.pow((ao - bo) / ab, 2)) < epsilon2 * ab
      )
        return true;
    }
    ao = bo;
  }
  return false;
}

function containsPolygon(coordinates, point) {
  return !!polygonContains(coordinates.map(ringRadians), pointRadians(point));
}

function ringRadians(ring) {
  return ring = ring.map(pointRadians), ring.pop(), ring;
}

function pointRadians(point) {
  return [point[0] * radians, point[1] * radians];
}

export default function(object, point) {
  return (object && containsObjectType.hasOwnProperty(object.type)
      ? containsObjectType[object.type]
      : containsGeometry)(object, point);
}
