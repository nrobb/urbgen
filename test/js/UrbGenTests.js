/**
 * URBGEN.Point tests.
 */
QUnit.module("URBGEN.Point");
QUnit.test("tests Constructor", function(assert) {
  var point = new URBGEN.Point(30, 20, 50);
  assert.ok(point.x === 30);
  assert.ok(point.y === 20);
  assert.ok(point.z === 50);
});
QUnit.test("tests setting neighbors", function(assert) {
  var point = new URBGEN.Point();
  var p1 = {};
  var p2 = {};
  var p3 = {};
  var p4 = {};
  point.neighbors[0] = p1;
  point.neighbors[1] = p2;
  point.neighbors[2] = p3;
  point.neighbors[3] = p4;
  assert.deepEqual(point.neighbors[0], p1);
  assert.deepEqual(point.neighbors[1], p2);
  assert.deepEqual(point.neighbors[2], p3);
  assert.deepEqual(point.neighbors[3], p4);
});
QUnit.test("tests setValues method", function(assert) {
  var point = new URBGEN.Point();
  var newPoint = new URBGEN.Point(20, 40, 10);
  point.setValues(newPoint);
  assert.deepEqual(point, newPoint);
});
QUnit.test("tests setValues method", function(assert) {
  var point = new URBGEN.Point(50, 20, 60);
  var newPoint = new URBGEN.Point(20, 40, 10);
  point.setValues(newPoint);
  assert.deepEqual(point, newPoint);
});
/**
 * URBGEN.Poly tests.
 */
QUnit.module("URBGEN.Poly");
QUnit.test("tests Constructor", function(assert) {
  var c1 = {};
  var c2 = {};
  var c3 = {};
  var c4 = {};
  var poly = new URBGEN.Poly(c1, c2, c3, c4);
  assert.deepEqual(poly.corners[0], c1);
  assert.deepEqual(poly.corners[1], c2);
  assert.deepEqual(poly.corners[2], c3);
  assert.deepEqual(poly.corners[3], c4);
});
/**
 * URBGEN.Poly.makeSimple test.
 */
QUnit.test("tests makeSimple method", function(assert) {
  var c1 = new URBGEN.Point(10, 10, 0);
  var c2 = new URBGEN.Point(50, 20, 0);
  var c3 = new URBGEN.Point(20, 60, 0);
  var c4 = new URBGEN.Point(70, 70, 0);
  var poly = new URBGEN.Poly(c1, c2, c3, c4);
  poly.makeSimple();
  var expected = [
    [0, 0, c3, c2],
    [0, c1, c4, 0],
    [c1, 0, 0, c4],
    [c2, c3, 0, 0]
  ];
  for (var i = 0; i < poly.corners.length; i++) {
    for (var j = 0; j < poly.corners[i].neighbors.length; j++) {
      assert.ok(poly.corners[i].neighbors[j] === expected[i][j]);
    }
  }
});