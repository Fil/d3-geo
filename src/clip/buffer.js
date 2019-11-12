import noop from "../noop.js";

export default function() {
  var lines = [],
      line;
  return {
    point(x, y) {
      line.push([x, y]);
    },
    lineStart() {
      lines.push(line = []);
    },
    lineEnd: noop,
    rejoin() {
      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
    },
    result() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
}
