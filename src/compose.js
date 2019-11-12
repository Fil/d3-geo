export default function(a, b) {

  function compose(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }

  if (a.invert && b.invert) compose.invert = (x, y) => (x = b.invert(x, y), x && a.invert(x[0], x[1]));

  return compose;
}
