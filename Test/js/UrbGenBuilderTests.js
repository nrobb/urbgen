/**
 * URBGEN.Builder.buildPolys tests.
 */
QUnit.module("URBGEN.Builder.buildPolys", {
  setup: function() {
    builder = new URBGEN.Builder();
  }
});
QUnit.test("tests building one poly", function(assert) {
  var c1 = new URBGEN.Point(10, 40, 20);
  var c2 = new URBGEN.Point(50, 20, 30);
  var c3 = new URBGEN.Point(20, 50, 60);
  var c4 = new URBGEN.Point(10, 40, 29);
  builder.newPoints = [[c1, c2, c3, c4]];
  var expected = [new URBGEN.Poly(c1, c2, c3, c4)];
  var actual = builder.buildPolys();
  assert.deepEqual(actual, expected);
  assert.ok(actual.length === 1);
});
QUnit.test("tests building two polys", function(assert) {
  var c1 = new URBGEN.Point(10, 40, 20);
  var c2 = new URBGEN.Point(50, 20, 30);
  var c3 = new URBGEN.Point(20, 50, 60);
  var c4 = new URBGEN.Point(10, 40, 29);
  var c5 = new URBGEN.Point(10, 40, 20);
  var c6 = new URBGEN.Point(50, 20, 30);
  var c7 = new URBGEN.Point(20, 50, 60);
  var c8 = new URBGEN.Point(10, 40, 29);
  builder.newPoints = [[c1, c2, c3, c4], [c5, c6, c7, c8]];
  var expected = [new URBGEN.Poly(c1, c2, c3, c4), new URBGEN.Poly(c5, c6, c7, c8)];
  var actual = builder.buildPolys();
  assert.deepEqual(actual, expected);
  assert.ok(actual.length === 2);
});
QUnit.test("tests building four polys", function(assert) {
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
  builder.newPoints = [
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
  var actual = builder.buildPolys();
  assert.deepEqual(actual, expected);
  assert.ok(actual.length === 4);
});
/**
 * URBGEN.Builder.HorizontalBuilder.Constructor test
 */
QUnit.module("URBGEN.Builder.HorizontalBuilder.Constructor");
QUnit.test("tests Constructor", function(assert) {
  var builder = new URBGEN.Builder.HorizontalBuilder();
  assert.ok(builder instanceof URBGEN.Builder.HorizontalBuilder);
  assert.ok(builder instanceof URBGEN.Builder);
});
/**
 * URBGEN.Builder.HorizontalBuilder.setOrigin tests.
 */
QUnit.module("URBGEN.Builder.HorizontalBuilder.setOrigin", {
  setup: function() {
    c1 = new URBGEN.Point(10, 10, 0);
    c2 = new URBGEN.Point(50, 20, 0);
    c3 = new URBGEN.Point(20, 60, 0);
    c4 = new URBGEN.Point(70, 70, 0);
    poly = new URBGEN.Poly(c1, c2, c3, c4);
    builder = new URBGEN.Builder.HorizontalBuilder();
    builder.poly = poly;
    poly.makeSimple();
  }
});
QUnit.test("tests setting origin point with reversed edge", function(assert) {
  poly.minEdgeLength = 5;
  poly.throughRoadStagger = 2;
  poly.density = 0.3;
  URBGEN.Variables.globalCityCenter = new URBGEN.Point(20, 70, 0);
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
QUnit.test("tests handling near points", function(assert) {
  var c5 = URBGEN.Util.linearInterpolate(c1, c3, 0.69);
  URBGEN.Util.insertPoint(c5, c1, c3);
  poly.minEdgeLength = 5;
  poly.throughRoadStagger = 1;
  poly.density = 0.3;
  URBGEN.Variables.globalCityCenter = new URBGEN.Point(20, 70, 0);
  var expected = c5;
  builder.setOrigin();
  var actual = builder.origin;
  assert.equal(actual, expected);
  assert.equal(actual.neighbors[0], c1);
  assert.equal(actual.neighbors[2], c3);
  assert.equal(c1.neighbors[2], actual);
  assert.equal(c3.neighbors[0], actual);
});
QUnit.test("tests setting origin point", function(assert) {
  poly.minEdgeLength = 0;
  poly.throughRoadStagger = 0;
  poly.density = 0.3;
  URBGEN.Variables.globalCityCenter = new URBGEN.Point(0, 0, 0);
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
/**
 * URBGEN.Builder.HorizontalBuilder.setEndPoints tests.
 */
QUnit.module("URBGEN.Builder.HorizontalBuilder.setEndPoints", {
  setup: function() {
    c1 = new URBGEN.Point(10, 10, 0);
    c2 = new URBGEN.Point(50, 20, 0);
    c3 = new URBGEN.Point(20, 60, 0);
    c4 = new URBGEN.Point(70, 70, 0);
    poly = new URBGEN.Poly(c1, c2, c3, c4);
    builder = new URBGEN.Builder.HorizontalBuilder();
    builder.poly = poly;
  }
});
QUnit.test("tests setting end points using grid angle", function(assert) {
  poly.makeSimple();
  poly.minEdgeLength = 0;
  poly.throughRoadStagger = 0;
  poly.density = 0.4;
  builder.setOrigin();
  builder.targets = [];
  URBGEN.Variables.globalCityGridX = 0.1;
  var angle = URBGEN.Util.getAngle(poly.corners[1], poly.corners[3]);
  var expected = URBGEN.Util.getIntersect(builder.origin, 0.1 * Math.PI, poly.corners[1], angle);
  builder.setEndPoints();
  var actual = builder.endPoints[0];
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
  assert.equal(actual.neighbors[0], c2);
  assert.equal(actual.neighbors[2], c4);
  assert.equal(c2.neighbors[2], actual);
  assert.equal(c4.neighbors[0], actual);
});
QUnit.test("tests setting end points using targets", function(assert) {
  poly.makeSimple();
  poly.minEdgeLength = 0;
  poly.throughRoadStagger = 0;
  poly.density = 0.4;
  builder.setOrigin();
  builder.targets = [new URBGEN.Point(500, 40, 0), new URBGEN.Point(200, 35, 0)];
  URBGEN.Variables.globalCityGridX = 0.1;
  var startAngle = URBGEN.Util.getAngle(builder.origin, builder.targets[1]);
  var endAngle = URBGEN.Util.getAngle(poly.corners[1], poly.corners[3]);
  var expected = URBGEN.Util.getIntersect(builder.origin, startAngle, poly.corners[1], endAngle);
  builder.setEndPoints();
  var actual = builder.endPoints[0];
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
  assert.equal(actual.neighbors[0], c2);
  assert.equal(actual.neighbors[2], c4);
  assert.equal(c2.neighbors[2], actual);
  assert.equal(c4.neighbors[0], actual);
});
QUnit.test("tests handling end points that lie off line segment", function(assert) {
  poly.makeSimple();
  poly.minEdgeLength = 10;
  poly.throughRoadStagger = 0;
  poly.density = 0.4;
  builder.setOrigin();
  builder.targets = [new URBGEN.Point(500, 40, 0), new URBGEN.Point(10, -100, 0)];
  URBGEN.Variables.globalCityGridX = 0.1;
  var expected = URBGEN.Util.linearInterpolateByLength(poly.corners[1], poly.corners[3], poly.minEdgeLength);
  builder.setEndPoints();
  var actual = builder.endPoints[0];
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
  assert.equal(actual.neighbors[0], c2);
  assert.equal(actual.neighbors[2], c4);
  assert.equal(c2.neighbors[2], actual);
  assert.equal(c4.neighbors[0], actual);
});
QUnit.test("tests handling near points", function(assert) {
  poly.makeSimple();
  poly.minEdgeLength = 10;
  poly.throughRoadStagger = 10;
  poly.density = 0.4;
  builder.setOrigin();
  builder.targets = [new URBGEN.Point(500, 40, 0), new URBGEN.Point(200, 35, 0)];
  URBGEN.Variables.globalCityGridX = 0.1;
  var startAngle = URBGEN.Util.getAngle(builder.origin, builder.targets[1]);
  var endAngle = URBGEN.Util.getAngle(poly.corners[1], poly.corners[3]);
  var c5 = URBGEN.Util.getIntersect(builder.origin, startAngle, poly.corners[1], endAngle);
  URBGEN.Util.insertPoint(c5, poly.corners[1], poly.corners[3]);
  builder.setEndPoints();
  var expected = c5;
  var actual = builder.endPoints[0];
  assert.equal(actual, expected);
  assert.equal(actual.neighbors[0], c2);
  assert.equal(actual.neighbors[2], c4);
  assert.equal(c2.neighbors[2], actual);
  assert.equal(c4.neighbors[0], actual);
});
/**
 * URBGEN.Builder.VerticalBuilder.Constructor test
 */
QUnit.module("URBGEN.Builder.VerticalBuilder.Constructor");
QUnit.test("tests Constructor", function(assert) {
  var builder = new URBGEN.Builder.VerticalBuilder();
  assert.ok(builder instanceof URBGEN.Builder.VerticalBuilder);
  assert.ok(builder instanceof URBGEN.Builder);
});
/**
 * URBGEN.Builder.VerticalBuilder.setOrigin tests.
 */
QUnit.module("URBGEN.Builder.VerticalBuilder.setOrigin", {
  setup: function() {
    c1 = new URBGEN.Point(10, 10, 0);
    c2 = new URBGEN.Point(50, 20, 0);
    c3 = new URBGEN.Point(20, 60, 0);
    c4 = new URBGEN.Point(70, 70, 0);
    poly = new URBGEN.Poly(c1, c2, c3, c4);
    builder = new URBGEN.Builder.VerticalBuilder();
    builder.poly = poly;
    poly.makeSimple();
  }
});
QUnit.test("tests setting origin point with reversed edge", function(assert) {
  poly.minEdgeLength = 5;
  poly.throughRoadStagger = 2;
  poly.density = 0.3;
  URBGEN.Variables.globalCityCenter = new URBGEN.Point(20, 70, 0);
  var expected = URBGEN.Util.linearInterpolate(poly.corners[0], poly.corners[1], 0.7);
  builder.setOrigin();
  var actual = builder.origin;
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
  assert.equal(actual.neighbors[1], c1);
  assert.equal(actual.neighbors[3], c2);
  assert.equal(c1.neighbors[3], actual);
  assert.equal(c2.neighbors[1], actual);
});
QUnit.test("tests handling near points", function(assert) {
  var c5 = URBGEN.Util.linearInterpolate(c1, c2, 0.69);
  URBGEN.Util.insertPoint(c5, c1, c2);
  poly.minEdgeLength = 5;
  poly.throughRoadStagger = 1;
  poly.density = 0.3;
  URBGEN.Variables.globalCityCenter = new URBGEN.Point(20, 70, 0);
  var expected = c5;
  builder.setOrigin();
  var actual = builder.origin;
  assert.equal(actual, expected);
  assert.equal(actual.neighbors[1], c1);
  assert.equal(actual.neighbors[3], c2);
  assert.equal(c1.neighbors[3], actual);
  assert.equal(c2.neighbors[1], actual);
});
QUnit.test("tests setting origin point", function(assert) {
  poly.minEdgeLength = 0;
  poly.throughRoadStagger = 0;
  poly.density = 0.3;
  URBGEN.Variables.globalCityCenter = new URBGEN.Point(0, 0, 0);
  var expected = URBGEN.Util.linearInterpolate(poly.corners[0], poly.corners[1], 0.3);
  builder.setOrigin();
  var actual = builder.origin;
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
  assert.equal(actual.neighbors[1], c1);
  assert.equal(actual.neighbors[3], c2);
  assert.equal(c1.neighbors[3], actual);
  assert.equal(c2.neighbors[1], actual);
});
/**
 * URBGEN.Builder.VerticalBuilder.setEndPoints tests.
 */
QUnit.module("URBGEN.Builder.VerticalBuilder.setEndPoints", {
  setup: function() {
    c1 = new URBGEN.Point(10, 10, 0);
    c2 = new URBGEN.Point(50, 20, 0);
    c3 = new URBGEN.Point(20, 60, 0);
    c4 = new URBGEN.Point(70, 70, 0);
    poly = new URBGEN.Poly(c1, c2, c3, c4);
    builder = new URBGEN.Builder.VerticalBuilder();
    builder.poly = poly;
  }
});
QUnit.test("tests setting end points using grid angle", function(assert) {
  poly.makeSimple();
  poly.minEdgeLength = 0;
  poly.throughRoadStagger = 0;
  poly.density = 0.4;
  builder.setOrigin();
  builder.targets = [];
  URBGEN.Variables.globalCityGridX = 0;
  var angle = URBGEN.Util.getAngle(poly.corners[2], poly.corners[3]);
  var expected = URBGEN.Util.getIntersect(builder.origin, 0.5 * Math.PI, poly.corners[2], angle);
  builder.setEndPoints();
  var actual = builder.endPoints[0];
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
  assert.equal(actual.neighbors[1], c3);
  assert.equal(actual.neighbors[3], c4);
  assert.equal(c3.neighbors[3], actual);
  assert.equal(c4.neighbors[1], actual);
});
QUnit.test("tests setting end points using targets", function(assert) {
  poly.makeSimple();
  poly.minEdgeLength = 0;
  poly.throughRoadStagger = 0;
  poly.density = 0.4;
  builder.setOrigin();
  builder.targets = [new URBGEN.Point(40, 400, 0), new URBGEN.Point(45, 200, 0)];
  URBGEN.Variables.globalCityGridX = 0.1;
  var startAngle = URBGEN.Util.getAngle(builder.origin, builder.targets[1]);
  var endAngle = URBGEN.Util.getAngle(poly.corners[2], poly.corners[3]);
  var expected = URBGEN.Util.getIntersect(builder.origin, startAngle, poly.corners[2], endAngle);
  builder.setEndPoints();
  var actual = builder.endPoints[0];
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
  assert.equal(actual.neighbors[1], c3);
  assert.equal(actual.neighbors[3], c4);
  assert.equal(c3.neighbors[3], actual);
  assert.equal(c4.neighbors[1], actual);
});
QUnit.test("tests handling end points that lie off line segment", function(assert) {
  poly.makeSimple();
  poly.minEdgeLength = 10;
  poly.throughRoadStagger = 0;
  poly.density = 0.4;
  builder.setOrigin();
  builder.targets = [new URBGEN.Point(40, 4000, 0), new URBGEN.Point(250, 250, 0)];
  URBGEN.Variables.globalCityGridX = 0.1;
  var length = URBGEN.Util.getLineSegmentLength(poly.corners[2], poly.corners[3]);
  var expected = URBGEN.Util.linearInterpolateByLength(poly.corners[2], poly.corners[3], length - poly.minEdgeLength);
  builder.setEndPoints();
  var actual = builder.endPoints[0];
  assert.ok(Math.abs(actual.x - expected.x) < 0.00001);
  assert.ok(Math.abs(actual.y - expected.y) < 0.00001);
  assert.ok(Math.abs(actual.z - expected.z) < 0.00001);
  assert.equal(actual.neighbors[1], c3);
  assert.equal(actual.neighbors[3], c4);
  assert.equal(c3.neighbors[3], actual);
  assert.equal(c4.neighbors[1], actual);
});
QUnit.test("tests handling near points", function(assert) {
  poly.makeSimple();
  poly.minEdgeLength = 10;
  poly.throughRoadStagger = 10;
  poly.density = 0.4;
  builder.setOrigin();
  builder.targets = [new URBGEN.Point(40, 400, 0), new URBGEN.Point(45, 200, 0)];
  URBGEN.Variables.globalCityGridX = 0.1;
  var startAngle = URBGEN.Util.getAngle(builder.origin, builder.targets[1]);
  var endAngle = URBGEN.Util.getAngle(poly.corners[2], poly.corners[3]);
  var c5 = URBGEN.Util.getIntersect(builder.origin, startAngle, poly.corners[2], endAngle);
  URBGEN.Util.insertPoint(c5, poly.corners[2], poly.corners[3]);
  builder.setEndPoints();
  var expected = c5;
  var actual = builder.endPoints[0];
  assert.equal(actual, expected);
  assert.equal(actual.neighbors[1], c3);
  assert.equal(actual.neighbors[3], c4);
  assert.equal(c3.neighbors[3], actual);
  assert.equal(c4.neighbors[1], actual);
});
/**
 * URBGEN.Builder.Director tests.
 */
QUnit.module("URBGEN.Builder.Director", {
  setup: function() {
    director = new URBGEN.Builder.Director();
    c1 = new URBGEN.Point(10, 10, 0);
    c2 = new URBGEN.Point(50, 20, 0);
    c3 = new URBGEN.Point(20, 60, 0);
    c4 = new URBGEN.Point(70, 70, 0);
    poly = new URBGEN.Poly(c1, c2, c3, c4);
    poly.density = 0.3;
    poly.minEdgeLength = 0;
    poly.throughRoadStagger = 10;
    poly.makeSimple();
    URBGEN.Variables.globalCityCenter = new URBGEN.Point(0, 0, 0);
    URBGEN.Variables.globalCityGridX = 0;
  }
});
QUnit.test("tests Constructor", function(assert) {
  assert.ok(director instanceof URBGEN.Builder.Director);
});
QUnit.test("tests execute method with horizontal builder", function(assert) {
  var start = URBGEN.Util.linearInterpolate(c1, c3, 0.3);
  var angle = URBGEN.Util.getGridAngle(c1, c3);
  var oppAngle = URBGEN.Util.getAngle(c2, c4);
  var end = URBGEN.Util.getIntersect(start, angle, c2, oppAngle);
  start.neighbors[3] = end;
  end.neighbors[1] = start;
  var expected = [
    new URBGEN.Poly(c1, c2, start, end),
    new URBGEN.Poly(start, end, c3, c4)
  ];
  var actual = director.execute(new URBGEN.Builder.HorizontalBuilder(), poly);
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 4; j++) {
      assert.ok(Math.abs(actual[i].corners[j].x - expected[i].corners[j].x) < 0.001);
      assert.ok(Math.abs(actual[i].corners[j].y - expected[i].corners[j].y) < 0.001);
      assert.ok(Math.abs(actual[i].corners[j].z - expected[i].corners[j].z) < 0.001);
    }
  }
  // Test neighbor relations
  assert.equal(actual[0].corners[0].neighbors[0], 0);
  assert.equal(actual[0].corners[0].neighbors[1], 0);
  assert.equal(actual[0].corners[0].neighbors[2], actual[0].corners[2]);
  assert.equal(actual[0].corners[0].neighbors[3], actual[0].corners[1]);
  assert.equal(actual[0].corners[1].neighbors[0], 0);
  assert.equal(actual[0].corners[1].neighbors[1], actual[0].corners[0]);
  assert.equal(actual[0].corners[1].neighbors[2], actual[0].corners[3]);
  assert.equal(actual[0].corners[1].neighbors[3], 0);
  assert.equal(actual[0].corners[2].neighbors[0], actual[0].corners[0]);
  assert.equal(actual[0].corners[2].neighbors[1], 0);
  assert.equal(actual[0].corners[2].neighbors[2], actual[1].corners[2]);
  assert.equal(actual[0].corners[2].neighbors[3], actual[0].corners[3]);
  assert.equal(actual[0].corners[3].neighbors[0], actual[0].corners[1]);
  assert.equal(actual[0].corners[3].neighbors[1], actual[0].corners[2]);
  assert.equal(actual[0].corners[3].neighbors[2], actual[1].corners[3]);
  assert.equal(actual[0].corners[3].neighbors[3], 0);
  assert.equal(actual[1].corners[2].neighbors[0], actual[1].corners[0]);
  assert.equal(actual[1].corners[2].neighbors[1], 0);
  assert.equal(actual[1].corners[2].neighbors[2], 0);
  assert.equal(actual[1].corners[2].neighbors[3], actual[1].corners[3]);
  assert.equal(actual[1].corners[3].neighbors[0], actual[1].corners[1]);
  assert.equal(actual[1].corners[3].neighbors[1], actual[1].corners[2]);
  assert.equal(actual[1].corners[3].neighbors[2], 0);
  assert.equal(actual[1].corners[3].neighbors[3], 0);
  // Test shared corners
  assert.equal(actual[0].corners[2], actual[1].corners[0]);
  assert.equal(actual[0].corners[3], actual[1].corners[1]);
});
QUnit.test("tests execute method with vertical builder", function(assert) {
  var start = URBGEN.Util.linearInterpolate(c1, c2, 0.3);
  var angle = URBGEN.Util.getGridAngle(c1, c2);
  var oppAngle = URBGEN.Util.getAngle(c3, c4);
  var end = URBGEN.Util.getIntersect(start, angle, c3, oppAngle);
  start.neighbors[2] = end;
  end.neighbors[0] = start;
  var expected = [
    new URBGEN.Poly(c1, start, c3, end),
    new URBGEN.Poly(start, c2, end, c4)
  ];
  var actual = director.execute(new URBGEN.Builder.VerticalBuilder(), poly);
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 4; j++) {
      assert.ok(Math.abs(actual[i].corners[j].x - expected[i].corners[j].x) < 0.001);
      assert.ok(Math.abs(actual[i].corners[j].y - expected[i].corners[j].y) < 0.001);
      assert.ok(Math.abs(actual[i].corners[j].z - expected[i].corners[j].z) < 0.001);
    }
  }
  // Test neighbor relations
  assert.equal(actual[0].corners[0].neighbors[0], 0);
  assert.equal(actual[0].corners[0].neighbors[1], 0);
  assert.equal(actual[0].corners[0].neighbors[2], actual[0].corners[2]);
  assert.equal(actual[0].corners[0].neighbors[3], actual[0].corners[1]);
  assert.equal(actual[0].corners[1].neighbors[0], 0);
  assert.equal(actual[0].corners[1].neighbors[1], actual[0].corners[0]);
  assert.equal(actual[0].corners[1].neighbors[2], actual[0].corners[3]);
  assert.equal(actual[0].corners[1].neighbors[3], actual[1].corners[1]);
  assert.equal(actual[0].corners[2].neighbors[0], actual[0].corners[0]);
  assert.equal(actual[0].corners[2].neighbors[1], 0);
  assert.equal(actual[0].corners[2].neighbors[2], 0);
  assert.equal(actual[0].corners[2].neighbors[3], actual[0].corners[3]);
  assert.equal(actual[0].corners[3].neighbors[0], actual[0].corners[1]);
  assert.equal(actual[0].corners[3].neighbors[1], actual[0].corners[2]);
  assert.equal(actual[0].corners[3].neighbors[2], 0);
  assert.equal(actual[0].corners[3].neighbors[3], actual[1].corners[3]);
  assert.equal(actual[1].corners[1].neighbors[0], 0);
  assert.equal(actual[1].corners[1].neighbors[1], actual[1].corners[0]);
  assert.equal(actual[1].corners[1].neighbors[2], actual[1].corners[3]);
  assert.equal(actual[1].corners[1].neighbors[3], 0);
  assert.equal(actual[1].corners[3].neighbors[0], actual[1].corners[1]);
  assert.equal(actual[1].corners[3].neighbors[1], actual[1].corners[2]);
  assert.equal(actual[1].corners[3].neighbors[2], 0);
  assert.equal(actual[1].corners[3].neighbors[3], 0);
  // Test shared corners
  assert.equal(actual[0].corners[1], actual[1].corners[0]);
  assert.equal(actual[0].corners[3], actual[1].corners[2]);
});