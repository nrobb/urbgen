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
/**
 * URBGEN.Util.linearInterpolate tests.
 */
QUnit.module("URBGEN.Util.linearInterpolate");
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 47; y1 = 122;
  var x2 = 96, y2 = 181;
  var r = 0.76;
  var xE = 2106/25, yE = 4171/25;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 10; y1 = -800;
  var x2 = 405, y2 = -500;
  var r = 0.76;
  var xE = 1551/5, yE = -572;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 423; y1 = 4000;
  var x2 = 500, y2 = 3000;
  var r = 0.289;
  var xE = 445.253, yE = 3711;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 423; y1 = 4000;
  var x2 = 500, y2 = 3000;
  var r = 3.7;
  var xE = 7079/10, yE = 300;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 423; y1 = 4000;
  var x2 = 500, y2 = 3000;
  var r = -2.2;
  var xE = 1268/5, yE = 6200;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 786; y1 = -34;
  var x2 = 40, y2 = -500;
  var r = 0;
  var xE = x1, yE = y1;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 67; y1 = 38;
  var x2 = 60, y2 = 36;
  var r = 1;
  var xE = x2, yE = y2;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 10; y1 = 4000;
  var x2 = 10, y2 = 3000;
  var r = -2;
  var xE = 10, yE = 6000;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 10; y1 = 4000;
  var x2 = 10, y2 = 3000;
  var r = 2;
  var xE = 10, yE = 2000;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 10; y1 = 4000;
  var x2 = 10, y2 = 3000;
  var r = 0.3;
  var xE = 10, yE = 3700;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 10; y1 = 58;
  var x2 = 105, y2 = 58;
  var r = -2;
  var xE = -180, yE = 58;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 108; y1 = 89;
  var x2 = 10, y2 = 89;
  var r = 2;
  var xE = -88, yE = 89;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolate", function(assert) {
  var x1 = 79; y1 = -300;
  var x2 = 344, y2 = -300;
  var r = 0.3;
  var xE = 317/2, yE = -300;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolate(p, q, r);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
/**
 * URBGEN.Util.getLineSegmentLength tests.
 */
QUnit.module("URBGEN.Util.getLineSegmentLength");
QUnit.test("URBGEN.Util.getLineSegmentLength", function(assert) {
  var x1 = 100, y1 = 100;
  var x2 = 400, y2 = 400;
  var expected = 424.2640687;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getLineSegmentLength(p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getLineSegmentLength", function(assert) {
  var x1 = 389, y1 = 276;
  var x2 = 309, y2 = 1987;
  var expected = 1712.869230;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getLineSegmentLength(p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getLineSegmentLength", function(assert) {
  var x1 = -487, y1 = 12387;
  var x2 = 123, y2 = -193;
  var expected = 12594.780665;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getLineSegmentLength(p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getLineSegmentLength", function(assert) {
  var x1 = 100, y1 = 200;
  var x2 = -700, y2 = -300;
  var expected = 943.398113;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getLineSegmentLength(p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getLineSegmentLength", function(assert) {
  var x1 = 500, y1 = 203;
  var x2 = 500, y2 = 509;
  var expected = 306;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getLineSegmentLength(p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getLineSegmentLength", function(assert) {
  var x1 = 23, y1 = 509;
  var x2 = 500, y2 = 509;
  var expected = 477;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getLineSegmentLength(p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getLineSegmentLength", function(assert) {
  var x1 = 23, y1 = 47;
  var x2 = 23, y2 = 47;
  var expected = 0;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getLineSegmentLength(p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
/**
 * URBGEN.Util.getAngle tests.
 */
QUnit.module("URBGEN.Util.getAngle");
QUnit.test("URBGEN.Util.getAngle", function(assert) {
  var x1 = 40, y1 = 40;
  var x2 = 400, y2 = 40;
  var expected = 0;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getAngle(p, q);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.getAngle", function(assert) {
  var x1 = 40, y1 = 40;
  var x2 = -400, y2 = 40;
  var expected = Math.PI;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getAngle(p, q);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.getAngle", function(assert) {
  var x1 = 40, y1 = 40;
  var x2 = 40, y2 = 400;
  var expected = Math.PI / 2;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getAngle(p, q);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.getAngle", function(assert) {
  var x1 = 40, y1 = 40;
  var x2 = 40, y2 = -400;
  var expected = Math.PI * 1.5;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getAngle(p, q);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.getAngle", function(assert) {
  var x1 = 40, y1 = 40;
  var x2 = 400, y2 = 400;
  var expected = Math.PI / 4;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getAngle(p, q);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.getAngle", function(assert) {
  var x1 = 40, y1 = 40;
  var x2 = -360, y2 = 440;
  var expected = Math.PI * 0.75;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getAngle(p, q);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.getAngle", function(assert) {
  var x1 = 40, y1 = 40;
  var x2 = -360, y2 = -360;
  var expected = Math.PI * 1.25;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getAngle(p, q);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.getAngle", function(assert) {
  var x1 = 40, y1 = 40;
  var x2 = 440, y2 = -360;
  var expected = Math.PI * 1.75;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var actual = URBGEN.Util.getAngle(p, q);
  assert.ok(actual === expected);
});
/**
 * URBGEN.Util.getIntersect tests.
 */
QUnit.module("URBGEN.Util.getIntersect");
QUnit.test("URBGEN.Util.getIntersect", function(assert) {
  var x1 = 50, y1 = 50;
  var x2 = 500, y2 = 500;
  var a1 = Math.PI / 2;
  var a2 = Math.PI;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var xE = 50, yE = 500;
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.getIntersect(p, a1, q, a2);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.getIntersect", function(assert) {
  var x1 = 50, y1 = 50;
  var x2 = 500, y2 = 500;
  var a1 = Math.PI;
  var a2 = Math.PI;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var xE = 50, yE = 50; // when lines are parallel, returns the first point
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.getIntersect(p, a1, q, a2);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.getIntersect", function(assert) {
  var x1 = 50, y1 = 50;
  var x2 = -500, y2 = -500;
  var a1 = Math.PI / 2;
  var a2 = Math.PI;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var xE = 50, yE = -500;
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.getIntersect(p, a1, q, a2);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.getIntersect", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 600, y2 = 500;
  var a1 = Math.PI / 4;
  var a2 = Math.PI;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var xE = 500, yE = 500;
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.getIntersect(p, a1, q, a2);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.getIntersect", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 40, y2 = 0;
  var a1 = Math.PI * 1.25;
  var a2 = Math.PI * 1.75;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var xE = 20, yE = 20;
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.getIntersect(p, a1, q, a2);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
/**
 * URBGEN.Util.divideLine tests.
 */
QUnit.module("URBGEN.Util.divideLine");
QUnit.test("tests dividing a line evenly", function(assert) {
  var x1 = 0; y1 = 0;
  var x2 = 100, y2 = 0;
  var l = 20;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, 0, 0];
  var expected = [
    p,
    {x: 20, y: 0, z: 0},
    {x: 40, y: 0, z: 0},
    {x: 60, y: 0, z: 0},
    {x: 80, y: 0, z: 0},
    q
  ];
  var actual = URBGEN.Util.divideLine(p, q, l);
  for (var i = 0; i < actual.length; i++) {
    assert.ok(Math.abs(actual[i].x - expected[i].x) < 0.00001);
    assert.ok(Math.abs(actual[i].y - expected[i].y) < 0.00001);
    assert.ok(actual[i].z === expected[i].z);
  }
});
QUnit.test("tests dividing a line evenly", function(assert) {
  var x1 = 0; y1 = 0;
  var x2 = 100, y2 = 100;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var l = URBGEN.Util.getLineSegmentLength(p, q) / 5;
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, 0, 0];
  var expected = [
    p,
    URBGEN.Util.linearInterpolateByLength(p, q, l),
    URBGEN.Util.linearInterpolateByLength(p, q, l * 2),
    URBGEN.Util.linearInterpolateByLength(p, q, l * 3),
    URBGEN.Util.linearInterpolateByLength(p, q, l * 4),
    q
  ];
  var actual = URBGEN.Util.divideLine(p, q, l);
  for (var i = 0; i < actual.length; i++) {
    assert.ok(Math.abs(actual[i].x - expected[i].x) < 0.00001);
    assert.ok(Math.abs(actual[i].y - expected[i].y) < 0.00001);
    assert.ok(actual[i].z === expected[i].z);
  }
});
QUnit.test("tests dividing a line with remainder", function(assert) {
  var x1 = 0; y1 = 0;
  var x2 = 100, y2 = 100;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var l = (URBGEN.Util.getLineSegmentLength(p, q) / 5) * 1.5;
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, 0, 0];
  var expected = [
    p,
    URBGEN.Util.linearInterpolateByLength(p, q, l),
    URBGEN.Util.linearInterpolateByLength(p, q, l * 2),
    q
  ];
  var actual = URBGEN.Util.divideLine(p, q, l);
  for (var i = 0; i < actual.length; i++) {
    assert.ok(Math.abs(actual[i].x - expected[i].x) < 0.00001);
    assert.ok(Math.abs(actual[i].y - expected[i].y) < 0.00001);
    assert.ok(actual[i].z === expected[i].z);
  }
});
QUnit.test("tests error thrown", function(assert) {
  assert.throws(
    function() {
      var p = {x: 0, y: 0, z: 0};
      var q = {x: 100, y: 100, z: 0};
      p.neighbors = [0, 0, 0, 0];
      q.neighbors = [0, 0, 0, 0];
      var l = 10;
      var actual = URBGEN.Util.divideLine(p, q, l);
    },
    /Points are not neighbors/
  );
});
/**
 * URBGEN.Util.linearInterpolateByLength tests.
 */
QUnit.module("URBGEN.Util.linearInterpolateByLength");
QUnit.test("URBGEN.Util.linearInterpolateByLength", function(assert) {
  var x1 = 0; y1 = 0;
  var x2 = 100, y2 = 0;
  var l = 50;
  var xE = 50, yE = 0;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolateByLength(p, q, l);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolateByLength", function(assert) {
  var x1 = 0; y1 = 0;
  var x2 = 100, y2 = 100;
  var l = Math.sqrt(20000) / 4;
  var xE = 25, yE = 25;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolateByLength(p, q, l);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolateByLength", function(assert) {
  var x1 = 0; y1 = 0;
  var x2 = -40, y2 = -200;
  var l = Math.sqrt(41600) / 10;
  var xE = -4, yE = -20;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolateByLength(p, q, l);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolateByLength", function(assert) {
  var x1 = 0; y1 = 0;
  var x2 = 100, y2 = 400;
  var xE = 100, yE = 400;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var l = URBGEN.Util.getLineSegmentLength(p, q);
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolateByLength(p, q, l);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolateByLength", function(assert) {
  var x1 = 0; y1 = 0;
  var x2 = 100, y2 = 400;
  var xE = 90, yE = 360;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var l = URBGEN.Util.getLineSegmentLength(p, q) * 0.9;
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolateByLength(p, q, l);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
QUnit.test("URBGEN.Util.linearInterpolateByLength", function(assert) {
  var x1 = 0; y1 = 0;
  var x2 = 100, y2 = 400;
  var xE = 100, yE = 400;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  // if l greater than line length, returns endpoint
  var l = URBGEN.Util.getLineSegmentLength(p, q) + 100;
  var expected = {x: xE, y: yE, z: 0};
  var actual = URBGEN.Util.linearInterpolateByLength(p, q, l);
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(actual.z === expected.z);
});
/**
 * URBGEN.Util.addAngle tests.
 */
QUnit.module("URBGEN.Util.addAngle");
QUnit.test("URBGEN.Util.addAngle", function(assert) {
  var a1 = 0.4 * Math.PI;
  var dA = 0.4;
  var expected = 0.8 * Math.PI;
  var actual = URBGEN.Util.addAngle(a1, dA);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.addAngle", function(assert) {
  var a1 = 0.9 * Math.PI;
  var dA = 2.1;
  var expected = Math.PI;
  var actual = URBGEN.Util.addAngle(a1, dA);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.addAngle", function(assert) {
  var a1 = 0;
  var dA =1.8;
  var expected = 1.8 * Math.PI;
  var actual = URBGEN.Util.addAngle(a1, dA);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.addAngle", function(assert) {
  var a1 = 0.4 * Math.PI;
  var dA = -0.5;
  var expected = 1.9 * Math.PI;
  var actual = URBGEN.Util.addAngle(a1, dA);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.addAngle", function(assert) {
  var a1 = 2 * Math.PI;
  var dA = -8;
  var expected = 0;
  var actual = URBGEN.Util.addAngle(a1, dA);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.addAngle", function(assert) {
  var a1 = 1.8 * Math.PI;
  var dA = -4.1;
  var expected = 1.7 * Math.PI;
  var actual = URBGEN.Util.addAngle(a1, dA);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.addAngle", function(assert) {
  var a1 = 0.9 * Math.PI;
  var dA = -0.4;
  var expected = 0.5 * Math.PI;
  var actual = URBGEN.Util.addAngle(a1, dA);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.addAngle", function(assert) {
  var a1 = 1.5 * Math.PI;
  var dA = 0.75;
  var expected = 0.25 * Math.PI;
  var actual = URBGEN.Util.addAngle(a1, dA);
  assert.ok(actual === expected);
});
/**
 * URBGEN.Util.getPointAsRatio tests.
 */
QUnit.module("URBGEN.Util.getPointAsRatio");
QUnit.test("URBGEN.Utl.getPointAsRatio", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 400, y2 = 0;
  var x3 = 200, y3 = 0;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var expected = 0.5;
  var actual = URBGEN.Util.getPointAsRatio(r, p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getPointAsRatio", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 400, y2 = 400;
  var x3 = 300, y3 = 300;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var expected = 0.75;
  var actual = URBGEN.Util.getPointAsRatio(r, p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getPointAsRatio", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = -400, y2 = -400;
  var x3 = -50, y3 = -50;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var expected = 0.125;
  var actual = URBGEN.Util.getPointAsRatio(r, p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getPointAsRatio", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 400, y2 = 200;
  var x3 = 200, y3 = 100;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var expected = 0.5;
  var actual = URBGEN.Util.getPointAsRatio(r, p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getPointAsRatio", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 500, y2 = 500;
  var x3 = 600, y3 = 600;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var expected = 1.2;
  var actual = URBGEN.Util.getPointAsRatio(r, p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getPointAsRatio", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 500, y2 = 500;
  var x3 = -400, y3 = -400;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var expected = -0.8;
  var actual = URBGEN.Util.getPointAsRatio(r, p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getPointAsRatio", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 500, y2 = 500;
  var x3 = -600, y3 = -600;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var expected = -1.2;
  var actual = URBGEN.Util.getPointAsRatio(r, p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getPointAsRatio", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 500, y2 = 500;
  var x3 = 0, y3 = 0;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var expected = 0;
  var actual = URBGEN.Util.getPointAsRatio(r, p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getPointAsRatio", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 500, y2 = 500;
  var x3 = 500, y3 = 500;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var expected = 1;
  var actual = URBGEN.Util.getPointAsRatio(r, p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.getPointAsRatio", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 0, y2 = 60;
  var x3 = 0, y3 = 25;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var expected = 25/60;
  var actual = URBGEN.Util.getPointAsRatio(r, p, q);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
/**
 * URBGEN.Util.areaPoly tests.
 */
QUnit.module("URBGEN.Util.areaPoly");
QUnit.test("URBGEN.Util.areaPoly", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 100, y2 = 0;
  var x3 = 0, y3 = 100;
  var x4 = 100, y4 = 100;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var s = {x: x4, y: y4, z: 0};
  var poly = {
    corners: [p, q, r, s]
  };
  var expected = 10000;
  var actual = URBGEN.Util.areaPoly(poly);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.areaPoly", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = 100, y2 = 10;
  var x3 = 0, y3 = 100;
  var x4 = 100, y4 = 100;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var s = {x: x4, y: y4, z: 0};
  var poly = {
    corners: [p, q, r, s]
  };
  var expected = 9500;
  var actual = URBGEN.Util.areaPoly(poly);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.areaPoly", function(assert) {
  var x1 = 3, y1 = 6;
  var x2 = 9, y2 = 7;
  var x3 = 2, y3 = 2;
  var x4 = 11, y4 = 2;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var s = {x: x4, y: y4, z: 0};
  var poly = {
    corners: [p, q, r, s]
  };
  var expected = 34;
  var actual = URBGEN.Util.areaPoly(poly);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.areaPoly", function(assert) {
  var x1 = -6, y1 = 12;
  var x2 = 16, y2 = 13;
  var x3 = -5, y3 = -7;
  var x4 = 15, y4 = -5;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var s = {x: x4, y: y4, z: 0};
  var poly = {
    corners: [p, q, r, s]
  };
  var expected = 388.5;
  var actual = URBGEN.Util.areaPoly(poly);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.areaPoly", function(assert) {
  var x1 = 300, y1 = 700;
  var x2 = 900, y2 = 900;
  var x3 = 100, y3 = 800;
  var x4 = 200, y4 = 1000;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var s = {x: x4, y: y4, z: 0};
  var poly = {
    corners: [p, q, r, s]
  };
  var expected = 125000;
  var actual = URBGEN.Util.areaPoly(poly);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
QUnit.test("URBGEN.Util.areaPoly", function(assert) {
  var x1 = 0, y1 = 0;
  var x2 = -20, y2 = 10;
  var x3 = -10, y3 = -10;
  var x4 = -30, y4 = -10;
  var p = {x: x1, y: y1, z: 0};
  var q = {x: x2, y: y2, z: 0};
  var r = {x: x3, y: y3, z: 0};
  var s = {x: x4, y: y4, z: 0};
  var poly = {
    corners: [p, q, r, s]
  };
  var expected = 350;
  var actual = URBGEN.Util.areaPoly(poly);
  assert.ok(Math.abs(actual - expected) < 0.00001);
});
/**
 * URBGEN.Util.getDirectedPath tests.
 */
QUnit.module("URBGEN.Util.getDirectedPath");
QUnit.test("URBGEN.Util.getDirectedPath", function(assert) {
  var p = {};
  var q = {};
  var r = {};
  var s = {};
  p.neighbors = [0, 0, 0, q];
  q.neighbors = [0, 0, p, r];
  r.neighbors = [0, 0, q, s];
  s.neighbors = [0, 0, r, 0];
  var expected = [p, q, r, s];
  var actual = URBGEN.Util.getDirectedPath(p, s, 3);
  assert.deepEqual(actual, expected);
});
QUnit.test("URBGEN.Util.getDirectedPath", function(assert) {
  var p = {};
  var q = {};
  var r = {};
  var s = {};
  p.neighbors = [0, 0, 0, q];
  q.neighbors = [0, p, 0, r];
  r.neighbors = [0, q, 0, s];
  s.neighbors = [0, r, 0, 0];
  var expected = [s, r, q, p];
  var actual = URBGEN.Util.getDirectedPath(s, p, 1);
  assert.deepEqual(actual, expected);
});
QUnit.test("URBGEN.Util.getDirectedPath", function(assert) {
  var p = {};
  var q = {};
  var r = {};
  var s = {};
  var t = {};
  var u = {};
  var v = {};
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, r, 0];
  r.neighbors = [q, 0, s, 0];
  s.neighbors = [r, 0, t, 0];
  t.neighbors = [s, 0, u, 0];
  u.neighbors = [t, 0, v, 0];
  v.neighbors = [u, 0, 0, 0];
  var expected = [p, q, r, s, t, u, v];
  var actual = URBGEN.Util.getDirectedPath(p, v, 2);
  assert.deepEqual(actual, expected);
});
QUnit.test("URBGEN.Util.getDirectedPath", function(assert) {
  var p = {};
  var q = {};
  var r = {};
  var s = {};
  var t = {};
  var u = {};
  var v = {};
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, r, 0];
  r.neighbors = [q, 0, s, 0];
  s.neighbors = [r, 0, t, 0];
  t.neighbors = [s, 0, u, 0];
  u.neighbors = [t, 0, v, 0];
  v.neighbors = [u, 0, 0, 0];
  var expected = [v, u, t, s, r, q, p];
  var actual = URBGEN.Util.getDirectedPath(v, p, 0);
  assert.deepEqual(actual, expected);
});
/**
 * URBGEN.Util.insertPoint tests.
 */
QUnit.module("URBGEN.Util.insertPoint");
QUnit.test("URBGEN.Util.insertPoint", function(assert) {
  var p = {};
  var q = {};
  var r = {};
  p.neighbors = [0, 0, r, 0];
  q.neighbors = [0, 0, 0, 0];
  r.neighbors = [p, 0, 0, 0];
  var actual = URBGEN.Util.insertPoint(q, p, r);
  assert.deepEqual(p.neighbors, [0, 0, q, 0]);
  assert.deepEqual(q.neighbors, [p, 0, r, 0]);
  assert.deepEqual(r.neighbors, [q, 0, 0, 0]);
  assert.ok(actual);
});
QUnit.test("URBGEN.Util.insertPoint", function(assert) {
  var p = {};
  var q = {};
  var r = {};
  p.neighbors = [0, 0, 0, r];
  q.neighbors = [0, 0, 0, 0];
  r.neighbors = [0, p, 0, 0];
  var actual = URBGEN.Util.insertPoint(q, p, r);
  assert.deepEqual(p.neighbors, [0, 0, 0, q]);
  assert.deepEqual(q.neighbors, [0, p, 0, r]);
  assert.deepEqual(r.neighbors, [0, q, 0, 0]);
  assert.ok(actual);
});
QUnit.test("URBGEN.Util.insertPoint", function(assert) {
  var p = {};
  var q = {};
  var r = {};
  p.neighbors = [r, 0, 0, 0];
  q.neighbors = [0, 0, 0, 0];
  r.neighbors = [0, 0, p, 0];
  var actual = URBGEN.Util.insertPoint(q, p, r);
  assert.deepEqual(p.neighbors, [q, 0, 0, 0]);
  assert.deepEqual(q.neighbors, [r, 0, p, 0]);
  assert.deepEqual(r.neighbors, [0, 0, q, 0]);
  assert.ok(actual);
});
QUnit.test("URBGEN.Util.insertPoint", function(assert) {
  var p = {};
  var q = {};
  var r = {};
  p.neighbors = [0, r, 0, 0];
  q.neighbors = [0, 0, 0, 0];
  r.neighbors = [0, 0, 0, p];
  var actual = URBGEN.Util.insertPoint(q, r, p);
  assert.deepEqual(p.neighbors, [0, q, 0, 0]);
  assert.deepEqual(q.neighbors, [0, r, 0, p]);
  assert.deepEqual(r.neighbors, [0, 0, 0, q]);
  assert.ok(actual);
});
/**
 * URBGEN.Util.getNeighbors tests
 */
QUnit.module("URBGEN.Util.getNeighbors");
QUnit.test("URBGEN.Util.getNeighbors", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 0, y: 10, z: 0};
  var r = {x: 0, y: 20, z: 0};
  var s = {x: 0, y: 30, z: 0};
  var t = {x: 0, y: 40, z: 0};
  var u = {x: 0, y: 50, z: 0};
  var v = {x: 0, y: 60, z: 0};
  var newPoint = {x: 0, y: 25, z: 0};
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, r, 0];
  r.neighbors = [q, 0, s, 0];
  s.neighbors = [r, 0, t, 0];
  t.neighbors = [s, 0, u, 0];
  u.neighbors = [t, 0, v, 0];
  v.neighbors = [u, 0, 0, 0];
  var points = [p, q, r, s, t, u, v];
  var expected = {prev: r, nxt: s};
  var actual = URBGEN.Util.getNeighbors(newPoint, points);
  assert.deepEqual(actual, expected);
});
QUnit.test("URBGEN.Util.getNeighbors", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 30, y: 10, z: 0};
  var r = {x: 45, y: 20, z: 0};
  var s = {x: 78, y: 30, z: 0};
  var t = {x: 100, y: 40, z: 0};
  var u = {x: 110, y: 50, z: 0};
  var v = {x: 120, y: 60, z: 0};
  var newPoint = URBGEN.Util.linearInterpolate(s, t, 0.5);
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, r, 0];
  r.neighbors = [q, 0, s, 0];
  s.neighbors = [r, 0, t, 0];
  t.neighbors = [s, 0, u, 0];
  u.neighbors = [t, 0, v, 0];
  v.neighbors = [u, 0, 0, 0];
  var points = [p, q, r, s, t, u, v];
  var expected = {prev: s, nxt: t};
  var actual = URBGEN.Util.getNeighbors(newPoint, points);
  assert.deepEqual(actual, expected);
});
QUnit.test("URBGEN.Util.getNeighbors", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 0, y: 10, z: 0};
  var r = {x: 0, y: 20, z: 0};
  var s = {x: 0, y: 30, z: 0};
  var t = {x: 0, y: 40, z: 0};
  var u = {x: 0, y: 50, z: 0};
  var v = {x: 0, y: 60, z: 0};
  var newPoint = {x: 0, y: 59, z: 0};
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, r, 0];
  r.neighbors = [q, 0, s, 0];
  s.neighbors = [r, 0, t, 0];
  t.neighbors = [s, 0, u, 0];
  u.neighbors = [t, 0, v, 0];
  v.neighbors = [u, 0, 0, 0];
  var points = [p, q, r, s, t, u, v];
  var expected = {prev: u, nxt: v};
  var actual = URBGEN.Util.getNeighbors(newPoint, points);
  assert.deepEqual(actual, expected);
});
QUnit.test("URBGEN.Util.getNeighbors", function(assert) {
  assert.throws(
    function() {
      var p = {x: 0, y: 0, z: 0};
      var q = {x: 0, y: 10, z: 0};
      var r = {x: 0, y: 20, z: 0};
      var s = {x: 0, y: 30, z: 0};
      var t = {x: 0, y: 40, z: 0};
      var u = {x: 0, y: 50, z: 0};
      var v = {x: 0, y: 60, z: 0};
      var newPoint = {x: 0, y: 80, z: 0};
      p.neighbors = [0, 0, q, 0];
      q.neighbors = [p, 0, r, 0];
      r.neighbors = [q, 0, s, 0];
      s.neighbors = [r, 0, t, 0];
      t.neighbors = [s, 0, u, 0];
      u.neighbors = [t, 0, v, 0];
      v.neighbors = [u, 0, 0, 0];
      var points = [p, q, r, s, t, u, v];
      URBGEN.Util.getNeighbors(newPoint, points);
    },
    /Points lies outside allowable range/
  );
});
QUnit.test("URBGEN.Util.getNeighbors", function(assert) {
  assert.throws(
    function() {
      var p = {x: 0, y: 0, z: 0};
      var q = {x: 0, y: 10, z: 0};
      var r = {x: 0, y: 20, z: 0};
      var s = {x: 0, y: 30, z: 0};
      var t = {x: 0, y: 40, z: 0};
      var u = {x: 0, y: 50, z: 0};
      var v = {x: 0, y: 60, z: 0};
      var newPoint = {x: 0, y: 0, z: 0};
      p.neighbors = [0, 0, q, 0];
      q.neighbors = [p, 0, r, 0];
      r.neighbors = [q, 0, s, 0];
      s.neighbors = [r, 0, t, 0];
      t.neighbors = [s, 0, u, 0];
      u.neighbors = [t, 0, v, 0];
      v.neighbors = [u, 0, 0, 0];
      var points = [p, q, r, s, t, u, v];
      URBGEN.Util.getNeighbors(newPoint, points);
    },
    /Points lies outside allowable range/
  );
});
/**
 * URBGEN.Util.checkNearPoints tests.
 */
QUnit.module("URBGEN.Util.checkNearPoints");
QUnit.test("URBGEN.Util.checkNearPoints", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 30, y: 10, z: 0};
  var r = {x: 45, y: 20, z: 0};
  var s = {x: 78, y: 30, z: 0};
  var t = {x: 100, y: 40, z: 0};
  var u = {x: 110, y: 50, z: 0};
  var v = {x: 120, y: 60, z: 0};
  var newPoint = URBGEN.Util.linearInterpolateByLength(s, t, 2);
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, r, 0];
  r.neighbors = [q, 0, s, 0];
  s.neighbors = [r, 0, t, 0];
  t.neighbors = [s, 0, u, 0];
  u.neighbors = [t, 0, v, 0];
  v.neighbors = [u, 0, 0, 0];
  var points = [p, q, r, s, t, u, v];
  var expected = s;
  var actual = URBGEN.Util.checkNearPoints(newPoint, points, 10, false);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.checkNearPoints", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 30, y: 10, z: 0};
  var r = {x: 45, y: 20, z: 0};
  var s = {x: 78, y: 30, z: 0};
  var t = {x: 100, y: 40, z: 0};
  var u = {x: 110, y: 50, z: 0};
  var v = {x: 120, y: 60, z: 0};
  var length = URBGEN.Util.getLineSegmentLength(q, r);
  var newPoint = URBGEN.Util.linearInterpolateByLength(q, r, length * 0.51);
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, r, 0];
  r.neighbors = [q, 0, s, 0];
  s.neighbors = [r, 0, t, 0];
  t.neighbors = [s, 0, u, 0];
  u.neighbors = [t, 0, v, 0];
  v.neighbors = [u, 0, 0, 0];
  var points = [p, q, r, s, t, u, v];
  var expected = r;
  var actual = URBGEN.Util.checkNearPoints(newPoint, points, length / 2, false);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.checkNearPoints", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 30, y: 10, z: 0};
  var r = {x: 45, y: 20, z: 0};
  var s = {x: 78, y: 30, z: 0};
  var t = {x: 100, y: 40, z: 0};
  var u = {x: 110, y: 50, z: 0};
  var v = {x: 120, y: 60, z: 0};
  var length = URBGEN.Util.getLineSegmentLength(q, r);
  var newPoint = URBGEN.Util.linearInterpolateByLength(q, r, length * 0.49);
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, r, 0];
  r.neighbors = [q, 0, s, 0];
  s.neighbors = [r, 0, t, 0];
  t.neighbors = [s, 0, u, 0];
  u.neighbors = [t, 0, v, 0];
  v.neighbors = [u, 0, 0, 0];
  var points = [p, q, r, s, t, u, v];
  var expected = q;
  var actual = URBGEN.Util.checkNearPoints(newPoint, points, length / 2, false);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.checkNearPoints", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 30, y: 10, z: 0};
  var r = {x: 45, y: 20, z: 0};
  var s = {x: 78, y: 30, z: 0};
  var t = {x: 100, y: 40, z: 0};
  var u = {x: 110, y: 50, z: 0};
  var v = {x: 120, y: 60, z: 0};
  var length = URBGEN.Util.getLineSegmentLength(q, r);
  var newPoint = URBGEN.Util.linearInterpolateByLength(q, r, length * 0.51);
  p.neighbors = [0, 0, q, 0];
  q.neighbors = [p, 0, r, 0];
  r.neighbors = [q, 0, s, 0];
  s.neighbors = [r, 0, t, 0];
  t.neighbors = [s, 0, u, 0];
  u.neighbors = [t, 0, v, 0];
  v.neighbors = [u, 0, 0, 0];
  var points = [p, q, r, s, t, u, v];
  var expected = newPoint;
  var actual = URBGEN.Util.checkNearPoints(newPoint, points, length / 4, false);
  assert.ok(actual === expected);
});
/**
 * URBGEN.Util.nearest tests
 */
QUnit.module("URBGEN.Util.nearest");
QUnit.test("URBGEN.Util.nearest", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 30, y: 10, z: 0};
  var r = {x: 45, y: 20, z: 0};
  var s = {x: 78, y: 30, z: 0};
  var t = {x: 100, y: 40, z: 0};
  var u = {x: 110, y: 50, z: 0};
  var v = {x: 120, y: 60, z: 0};
  var target = {x: 122, y: 67, z: 0};
  var points = [p, q, r, s, t, u, v];
  var expected = v;
  var actual = URBGEN.Util.nearest(points, target);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.nearest", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 30, y: 10, z: 0};
  var r = {x: 45, y: 20, z: 0};
  var s = {x: 78, y: 30, z: 0};
  var t = {x: 100, y: 40, z: 0};
  var u = {x: 110, y: 50, z: 0};
  var v = {x: 120, y: 60, z: 0};
  var target = {x: 34, y: 56, z: 0};
  var points = [p, q, r, s, t, u, v];
  var expected = r;
  var actual = URBGEN.Util.nearest(points, target);
  assert.ok(actual === expected);
});
QUnit.test("URBGEN.Util.nearest", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 30, y: 10, z: 0};
  var r = {x: 45, y: 20, z: 0};
  var s = {x: 78, y: 30, z: 0};
  var t = {x: 100, y: 40, z: 0};
  var u = {x: 110, y: 50, z: 0};
  var v = {x: 120, y: 60, z: 0};
  var target = {x: 800, y: -400, z: 0};
  var points = [p, q, r, s, t, u, v];
  var expected = v;
  var actual = URBGEN.Util.nearest(points, target);
  assert.ok(actual === expected);
});
/**
 * URBGEN.Util.unitVector tests.
 */
QUnit.module("URBGEN.Util.unitVector");
QUnit.test("tests returning unit vector", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 3, y: 4, z: 0};
  var actual = URBGEN.Util.unitVector(p, q);
  var expected = {x: 3/5, y: 4/5, z: 0};
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
});
QUnit.test("test using angle", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 3, y: 4, z: 0};
  var angle = URBGEN.Util.getAngle(p, q);
  var actual = URBGEN.Util.unitVectorByAngle(p, angle);
  var expected = {x: 3/5, y: 4/5, z: 0};
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
});
/**
 * URBGEN.Util.unitNormal tests.
 */
QUnit.module("URBGEN.Util.unitNormal");
QUnit.test("test unit normal", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 3, y: 4, z: 0};
  var actual = URBGEN.Util.unitNormal(p, q);
  var expected = {x: -4/5, y: 3/5, z: 0};
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
});
/**
 * URBGEN.Util.offsetLineSegment tests
 */
QUnit.module("URBGEN.Util.offsetLineSegment");
QUnit.test("test offsetting line seg", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 3, y: 4, z: 0};
  var actual = URBGEN.Util.offsetLineSegment(p, q, 1);
  var expected = [
    {x: -0.8, y: 0.6, z: 0},
    {x: 2.2, y: 3.4, z: 0}
  ];
  assert.ok(Math.abs(actual[0].x - expected[0].x) < 0.00001);
  assert.ok(Math.abs(actual[0].y - expected[0].y) < 0.00001);
  assert.ok(Math.abs(actual[0].z - expected[0].z) < 0.00001);
});
QUnit.test("test offsetting line seg", function(assert) {
  var p = {x: 3, y: 4, z: 0};
  var q = {x: 0, y: 0, z: 0};
  var actual = URBGEN.Util.offsetLineSegment(p, q, 2);
  var expected = [
    {x: 4.6, y: 2.8, z: 0},
    {x: 1.6, y: -1.2, z: 0}
  ];
  assert.ok(Math.abs(actual[0].x - expected[0].x) < 0.00001);
  assert.ok(Math.abs(actual[0].y - expected[0].y) < 0.00001);
  assert.ok(Math.abs(actual[0].z - expected[0].z) < 0.00001);
});
QUnit.test("test offsetting line seg", function(assert) {
  var p = {x: 0, y: 0, z: 0};
  var q = {x: 10, y: 0, z: 0};
  var actual = URBGEN.Util.offsetLineSegment(p, q, 2);
  var expected = [
    {x: 0, y: 2, z: 0},
    {x: 10, y: 2, z: 0}
  ];
  assert.ok(Math.abs(actual[0].x - expected[0].x) < 0.00001);
  assert.ok(Math.abs(actual[0].y - expected[0].y) < 0.00001);
  assert.ok(Math.abs(actual[0].z - expected[0].z) < 0.00001);
});
QUnit.test("test offsetting line seg", function(assert) {
  var p = {x: 0, y: 10, z: 0};
  var q = {x: 0, y: 0, z: 0};
  var actual = URBGEN.Util.offsetLineSegment(p, q, 4);
  var expected = [
    {x: 4, y: 10, z: 0},
    {x: 4, y: 0, z: 0}
  ];
  assert.ok(Math.abs(actual[0].x - expected[0].x) < 0.00001);
  assert.ok(Math.abs(actual[0].y - expected[0].y) < 0.00001);
  assert.ok(Math.abs(actual[0].z - expected[0].z) < 0.00001);
});
