/**
 * URBGEN.Builder.buildPolys tests.
 */
QUnit.test("URBGEN.Builder.buildPolys", function(assert) {
  var c1 = new URBGEN.Point(10, 40, 20);
  var c2 = new URBGEN.Point(50, 20, 30);
  var c3 = new URBGEN.Point(20, 50, 60);
  var c4 = new URBGEN.Point(10, 40, 29);
  var points = [[c1, c2, c3, c4]];
  var expected = new URBGEN.Poly(c1, c2, c3, c4);
  var polys = URBGEN.Builder.prototype.buildPolys(points);
  var actual = polys[0];
  assert.deepEqual(actual, expected);
  assert.ok(polys.length === 1);
});
QUnit.test("URBGEN.Builder.buildPolys", function(assert) {
  var c1 = new URBGEN.Point(10, 40, 20);
  var c2 = new URBGEN.Point(50, 20, 30);
  var c3 = new URBGEN.Point(20, 50, 60);
  var c4 = new URBGEN.Point(10, 40, 29);
  var c5 = new URBGEN.Point(10, 40, 20);
  var c6 = new URBGEN.Point(50, 20, 30);
  var c7 = new URBGEN.Point(20, 50, 60);
  var c8 = new URBGEN.Point(10, 40, 29);
  var points = [[c1, c2, c3, c4], [c5, c6, c7, c8]];
  var expected = [new URBGEN.Poly(c1, c2, c3, c4), new URBGEN.Poly(c5, c6, c7, c8)];
  var actual = URBGEN.Builder.prototype.buildPolys(points);
  assert.deepEqual(actual, expected);
  assert.ok(actual.length === 2);
});
QUnit.test("URBGEN.Builder.buildPolys", function(assert) {
  var c1 = new URBGEN.Point(10, 40, 20);
  var c2 = new URBGEN.Point(50, 20, 30);
  var c3 = new URBGEN.Point(20, 50, 60);
  var c4 = new URBGEN.Point(10, 40, 29);
  var c5 = new URBGEN.Point(10, 40, 20);
  var c6 = new URBGEN.Point(50, 20, 30);
  var c7 = new URBGEN.Point(20, 50, 60);
  var c8 = new URBGEN.Point(10, 40, 29);
  var c9 = new URBGEN.Point(10, 40, 20);
  var c10 = new URBGEN.Point(50, 20, 30);
  var c11 = new URBGEN.Point(20, 50, 60);
  var c12 = new URBGEN.Point(10, 40, 29);
  var c13 = new URBGEN.Point(10, 40, 20);
  var c14 = new URBGEN.Point(50, 20, 30);
  var c15 = new URBGEN.Point(20, 50, 60);
  var c16 = new URBGEN.Point(10, 40, 29);
  var points = [
    [c1, c2, c3, c4],
    [c5, c6, c7, c8],
    [c9, c10, c11, c12],
    [c13, c14, c15, c16]
  ];
  var expected = [
    new URBGEN.Poly(c1, c2, c3, c4),
    new URBGEN.Poly(c5, c6, c7, c8),
    new URBGEN.Poly(c9, c10, c11, c12),
    new URBGEN.Poly(c13, c14, c15, c16)
  ];
  var actual = URBGEN.Builder.prototype.buildPolys(points);
  assert.deepEqual(actual, expected);
  assert.ok(actual.length === 4);
});
/**
 * URBGEN.Builder.HorizontalBuilder.Constructor test
 */
QUnit.test("URBGEN.Builder.HorizontalBuilder.Constructor", function(assert) {
  var builder = new URBGEN.Builder.HorizontalBuilder();
  assert.ok(builder instanceof URBGEN.Builder.HorizontalBuilder);
  assert.ok(builder instanceof URBGEN.Builder);
});
/**
 * URBGEN.Builder.HorizontalBuilder.setStart tests.
 */
QUnit.test("URBGEN.Builder.HorizontalBuilder.setStart", function(assert) {
  var c1 = new URBGEN.Point(10, 10, 0);
  var c2 = new URBGEN.Point(50, 20, 0);
  var c3 = new URBGEN.Point(20, 60, 0);
  var c4 = new URBGEN.Point(70, 70, 0);
  var poly = new URBGEN.Poly(c1, c2, c3, c4);
  poly.makeSimple();
  poly.minEdgeLength = 5;
  poly.throughRoadStagger = 2;
  poly.density = 0.3;
  URBGEN.Variables.globalCityCenter = new URBGEN.Point(20, 70, 0);
  var builder = new URBGEN.Builder.HorizontalBuilder();
  builder.poly = poly;
  var expected = URBGEN.Util.linearInterpolate(poly.corners[0], poly.corners[2], 0.7);
  builder.setOrigin();
  var actual = builder.origin;
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
  assert.equal(actual.neighbors[0], c1);
  assert.equal(actual.neighbors[2], c3);
  assert.equal(c1.neighbors[2], actual);
  assert.equal(c3.neighbors[0], actual);
});
QUnit.test("URBGEN.Builder.HorizontalBuilder.setStart", function(assert) {
  var c1 = new URBGEN.Point(10, 10, 0);
  var c2 = new URBGEN.Point(50, 20, 0);
  var c3 = new URBGEN.Point(20, 60, 0);
  var c4 = new URBGEN.Point(70, 70, 0);
  var poly = new URBGEN.Poly(c1, c2, c3, c4);
  poly.makeSimple();
  var c5 = URBGEN.Util.linearInterpolate(c1, c3, 0.69);
  URBGEN.Util.insertPoint(c5, c1, c3);
  poly.minEdgeLength = 5;
  poly.throughRoadStagger = 1;
  poly.density = 0.3;
  URBGEN.Variables.globalCityCenter = new URBGEN.Point(20, 70, 0);
  var builder = new URBGEN.Builder.HorizontalBuilder();
  builder.poly = poly;
  var expected = c5;
  builder.setOrigin();
  var actual = builder.origin;
  assert.equal(actual, expected);
  assert.equal(actual.neighbors[0], c1);
  assert.equal(actual.neighbors[2], c3);
  assert.equal(c1.neighbors[2], actual);
  assert.equal(c3.neighbors[0], actual);
});
QUnit.test("URBGEN.Builder.HorizontalBuilder.setStart", function(assert) {
  var c1 = new URBGEN.Point(10, 10, 0);
  var c2 = new URBGEN.Point(50, 20, 0);
  var c3 = new URBGEN.Point(20, 60, 0);
  var c4 = new URBGEN.Point(70, 70, 0);
  var poly = new URBGEN.Poly(c1, c2, c3, c4);
  poly.makeSimple();
  poly.minEdgeLength = 0;
  poly.throughRoadStagger = 0;
  poly.density = 0.3;
  URBGEN.Variables.globalCityCenter = new URBGEN.Point(0, 0, 0);
  var builder = new URBGEN.Builder.HorizontalBuilder();
  builder.poly = poly;
  var expected = URBGEN.Util.linearInterpolate(poly.corners[0], poly.corners[2], 0.3);
  builder.setOrigin();
  var actual = builder.origin;
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
  assert.equal(actual.neighbors[0], c1);
  assert.equal(actual.neighbors[2], c3);
  assert.equal(c1.neighbors[2], actual);
  assert.equal(c3.neighbors[0], actual);
});