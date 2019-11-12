import clipRectangle from "./rectangle.js";

export default function() {
  let x0 = 0, y0 = 0, x1 = 960, y1 = 500, cache, cacheStream, clip;

  return clip = {
    stream(stream) {
      return cache && cacheStream === stream ? cache : cache = clipRectangle(x0, y0, x1, y1)(cacheStream = stream);
    },
    extent(_) {
      return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], cache = cacheStream = null, clip) : [[x0, y0], [x1, y1]];
    }
  };
}
