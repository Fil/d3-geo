export default function(methods) {
  return {
    stream: transformer(methods)
  };
}

export function transformer(methods) {
  return stream => {
    var s = new TransformStream;
    for (var key in methods) s[key] = methods[key];
    s.stream = stream;
    return s;
  };
}

function TransformStream() {}

TransformStream.prototype = {
  constructor: TransformStream,
  point(x, y) { this.stream.point(x, y); },
  sphere() { this.stream.sphere(); },
  lineStart() { this.stream.lineStart(); },
  lineEnd() { this.stream.lineEnd(); },
  polygonStart() { this.stream.polygonStart(); },
  polygonEnd() { this.stream.polygonEnd(); }
};
