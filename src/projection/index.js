import clipAntimeridian from "../clip/antimeridian.js";
import clipCircle from "../clip/circle.js";
import clipRectangle from "../clip/rectangle.js";
import compose from "../compose.js";
import identity from "../identity.js";
import {cos, degrees, radians, sin, sqrt} from "../math.js";
import {rotateRadians} from "../rotation.js";
import {transformer} from "../transform.js";
import {fitExtent, fitSize, fitWidth, fitHeight} from "./fit.js";
import resample from "./resample.js";

const transformRadians = transformer({
  point(x, y) {
    this.stream.point(x * radians, y * radians);
  }
});

function transformRotate(rotate) {
  return transformer({
    point(x, y) {
      const r = rotate(x, y);
      return this.stream.point(r[0], r[1]);
    }
  });
}

function scaleTranslate(k, dx, dy) {
  function transform(x, y) {
    return [dx + k * x, dy - k * y];
  }
  transform.invert = (x, y) => [(x - dx) / k, (dy - y) / k];
  return transform;
}

function scaleTranslateRotate(k, dx, dy, alpha) {
  const cosAlpha = cos(alpha), sinAlpha = sin(alpha), a = cosAlpha * k, b = sinAlpha * k, ai = cosAlpha / k, bi = sinAlpha / k, ci = (sinAlpha * dy - cosAlpha * dx) / k, fi = (sinAlpha * dx + cosAlpha * dy) / k;
  function transform(x, y) {
    return [a * x - b * y + dx, dy - b * x - a * y];
  }
  transform.invert = (x, y) => [ai * x - bi * y + ci, fi - bi * x - ai * y];
  return transform;
}

export default function projection(project) {
  return projectionMutator(() => project)();
}

export function projectionMutator(projectAt) {
  let project,
      // scale
      k = 150,
      x = 480,
      // translate
      y = 250,
      lambda = 0,
      // center
      phi = 0,
      deltaLambda = 0,
      deltaPhi = 0,
      deltaGamma = 0,
      // pre-rotate
      rotate,
      // post-rotate
      alpha = 0,
      theta = null,
      // pre-clip angle
      preclip = clipAntimeridian,
      x0 = null,
      y0,
      x1,
      y1,
      // post-clip extent
      postclip = identity,
      // precision
      delta2 = 0.5,
      projectResample,
      projectTransform,
      projectRotateTransform,
      cache,
      cacheStream;

  function projection(point) {
    return projectRotateTransform(point[0] * radians, point[1] * radians);
  }

  function invert(point) {
    point = projectRotateTransform.invert(point[0], point[1]);
    return point && [point[0] * degrees, point[1] * degrees];
  }

  projection.stream = stream => cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));

  projection.preclip = function(_) {
    return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
  };

  projection.postclip = function(_) {
    return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
  };

  projection.clipAngle = function(_) {
    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
  };

  projection.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
  };

  projection.scale = function(_) {
    return arguments.length ? (k = +_, recenter()) : k;
  };

  projection.translate = function(_) {
    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
  };

  projection.center = function(_) {
    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
  };

  projection.rotate = function(_) {
    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
  };

  projection.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
  };

  projection.precision = function(_) {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
  };

  projection.fitExtent = (extent, object) => fitExtent(projection, extent, object);

  projection.fitSize = (size, object) => fitSize(projection, size, object);

  projection.fitWidth = (width, object) => fitWidth(projection, width, object);

  projection.fitHeight = (height, object) => fitHeight(projection, height, object);

  function recenter() {
    const center = scaleTranslateRotate(k, 0, 0, alpha).apply(null, project(lambda, phi)), transform = (alpha ? scaleTranslateRotate : scaleTranslate)(k, x - center[0], y - center[1], alpha);
    rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
    projectTransform = compose(project, transform);
    projectRotateTransform = compose(rotate, projectTransform);
    projectResample = resample(projectTransform, delta2);
    return reset();
  }

  function reset() {
    cache = cacheStream = null;
    return projection;
  }

  return function(...args) {
    project = projectAt.apply(this, args);
    projection.invert = project.invert && invert;
    return recenter();
  };
}
