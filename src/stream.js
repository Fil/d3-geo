function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}

const streamObjectType = {
  Feature(object, stream) {
    streamGeometry(object.geometry, stream);
  },
  FeatureCollection(object, stream) {
    const features = object.features;
    let i = -1;
    const n = features.length;
    while (++i < n) streamGeometry(features[i].geometry, stream);
  }
};

var streamGeometryType = {
  Sphere(object, stream) {
    stream.sphere();
  },
  Point(object, stream) {
    object = object.coordinates;
    stream.point(object[0], object[1], object[2]);
  },
  MultiPoint(object, stream) {
    const coordinates = object.coordinates;
    let i = -1;
    const n = coordinates.length;
    while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
  },
  LineString(object, stream) {
    streamLine(object.coordinates, stream, 0);
  },
  MultiLineString(object, stream) {
    const coordinates = object.coordinates;
    let i = -1;
    const n = coordinates.length;
    while (++i < n) streamLine(coordinates[i], stream, 0);
  },
  Polygon(object, stream) {
    streamPolygon(object.coordinates, stream);
  },
  MultiPolygon(object, stream) {
    const coordinates = object.coordinates;
    let i = -1;
    const n = coordinates.length;
    while (++i < n) streamPolygon(coordinates[i], stream);
  },
  GeometryCollection(object, stream) {
    const geometries = object.geometries;
    let i = -1;
    const n = geometries.length;
    while (++i < n) streamGeometry(geometries[i], stream);
  }
};

function streamLine(coordinates, stream, closed) {
  let i = -1;
  const n = coordinates.length - closed;
  let coordinate;
  stream.lineStart();
  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
  stream.lineEnd();
}

function streamPolygon(coordinates, stream) {
  let i = -1;
  const n = coordinates.length;
  stream.polygonStart();
  while (++i < n) streamLine(coordinates[i], stream, 1);
  stream.polygonEnd();
}

export default function(object, stream) {
  if (object && streamObjectType.hasOwnProperty(object.type)) {
    streamObjectType[object.type](object, stream);
  } else {
    streamGeometry(object, stream);
  }
}
