////////////////////////////////////////////////////////////////////////////////
// URBGEN
////////////////////////////////////////////////////////////////////////////////
/**
 * Global namespace
 */
var URBGEN = URBGEN || {};
/**
 * Defines a point, specified by x, y, and z coords
 */
URBGEN.Point = function(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  this.neighbors = [0, 0, 0, 0];
};
URBGEN.Point.prototype.setValues = function(point) {
  this.x = point.x;
  this.y = point.y;
  this.z = point.z;
};
/**
 * Defines a polygon, specified by four points.
 */
URBGEN.Poly = function(p0, p1, p2, p3) {
  this.corners = [p0, p1, p2, p3];
  this.edgeLengths = [
    URBGEN.Util.getLineSegmentLength(this.corners[0], this.corners[1]),
    URBGEN.Util.getLineSegmentLength(this.corners[1], this.corners[3]),
    URBGEN.Util.getLineSegmentLength(this.corners[0], this.corners[2]),
    URBGEN.Util.getLineSegmentLength(this.corners[2], this.corners[3])
  ];
  this.minEdgeLength;
  this.throughRoadStagger;
  this.regularity1;
  this.gridAngle;
  this.atomic = false;
  this.height = 0;
};
/**
 * Sets this poly's grid angle
 */
URBGEN.Poly.prototype.setGridAngle = function() {
  var start = URBGEN.Util.linearInterpolate(this.corners[0], this.corners[2], 0.5);
  var end = URBGEN.Util.linearInterpolate(this.corners[1], this.corners[3], 0.5);
  this.gridAngle = URBGEN.Util.getAngle(start, end);
};
/**
 * Sets this poly's corners as neighbors.
 */
URBGEN.Poly.prototype.makeSimple = function() {
  this.corners[0].neighbors[2] = this.corners[2];
  this.corners[0].neighbors[3] = this.corners[1];
  this.corners[1].neighbors[1] = this.corners[0];
  this.corners[1].neighbors[2] = this.corners[3];
  this.corners[2].neighbors[0] = this.corners[0];
  this.corners[2].neighbors[3] = this.corners[3];
  this.corners[3].neighbors[0] = this.corners[1];
  this.corners[3].neighbors[1] = this.corners[2];
};
/**
 * Constructs a city generator.
 */
URBGEN.Generator = function() {
  this.horizontalBuilder = new URBGEN.Builder.HorizontalBuilder();
  this.verticalBuilder = new URBGEN.Builder.VerticalBuilder();
  this.plotBuilder = new URBGEN.Builder.PlotBuilder();
  this.builder;
  this.director = new URBGEN.Builder.Director();
  this.cityPolys = [];
  this.buildings = [];
  this.nodes = [];
  this.geometry = {vertices: [], faces: []};
  this.center;
  this.cityArea;
  this.initRandom();
};
/**
 * Sets up random variables
 */
URBGEN.Generator.prototype.initRandom = function() {
  this.regularity1 = Math.random() * 0.2 + 0.4;
  this.regularity2 = Math.random() * 0.2 + 0.4;
  this.blockSize = Math.random() * 20000 + 10000;
  this.buildingSize = 2000;
  this.width = window.innerWidth * 0.95;
  this.depth = window.innerHeight * 0.95;
  this.gridThreshold = Math.random();
  this.minEdgeLength = Math.random() * 10 + 40;
  this.throughRoadStagger = Math.random() * 50;
  this.init();
};
/**
 * Sets up variables
 */
URBGEN.Generator.prototype.init = function() {
  this.cityPolys = [];
  this.buildings = [];
  var topLeft = new URBGEN.Point(0, 0, 0);
  var topRight = new URBGEN.Point(this.width, 0, 0);
  var bottomLeft = new URBGEN.Point(1, this.depth, 0);
  var bottomRight = new URBGEN.Point(this.width - 1, this.depth, 0);
  var poly = new URBGEN.Poly(topLeft, topRight, bottomLeft, bottomRight);
  this.center = new URBGEN.Point(this.width / 2, this.depth / 2, 0);
  this.cityArea = URBGEN.Util.areaPoly(poly);
  this.minPolySize = this.blockSize;
  poly.makeSimple();
  this.cityPolys.push(poly);
  var polys = [poly];
};
/**
 * somethings a city.
 */
URBGEN.Generator.prototype.something = function(polys) {
  var newPolys = [];
  for (var i = 0; i < polys.length; i++) {
    newPolys = newPolys.concat(this.processPoly(polys[i]));
  }
  if (polys.length !== newPolys.length) {
    return this.something(newPolys);
  }
  return newPolys;
};
/**
 * something
 */
URBGEN.Generator.prototype.generate = function() {
  this.cityPolys = this.something(this.cityPolys);

  for (var i = 0; i < this.cityPolys.length; i++) {
    this.cityPolys[i] = URBGEN.Util.insetPoly(this.cityPolys[i], 5);
    this.cityPolys[i].makeSimple();
  }
  
  
  // get the buildings
  this.builder = this.plotBuilder;
  for (var j = 0; j < this.cityPolys.length; j++) {
    this.builder.poly = this.cityPolys[j];
    this.buildings = this.buildings.concat(this.director.execute(this.builder));
  }
  // TODO this is a bit hacky
  for (var k = 0; k < this.buildings.length; k++) {
    //this.buildings[k] = URBGEN.Util.insetPoly(this.buildings[k], 1);
    this.buildings[k].height = Math.random() * 20 + 20;
  }
  
  this.buildGeometry();
};
/**
 * Builds 3D geometry
 */
URBGEN.Generator.prototype.buildGeometry = function() {
  this.geometry.faces = [];
  this.geometry.vertices = [];
  var city = this.buildings;
  for (var i = 0; i < city.length; i++) {
    var building = city[i];
    for (var j = 0; j < building.corners.length; j++) {
      var vertex = building.corners[j];
      this.geometry.vertices.push([vertex.x, vertex.y, building.height]);
    }
    for (var k = 0; k < building.corners.length; k++) {
      var vertex = building.corners[k];
      this.geometry.vertices.push([vertex.x, vertex.y, 0]);
    }
  }
  for (var l = 1; l < this.geometry.vertices.length + 1; l += 8) {
    this.geometry.faces.push([l, l + 1, l + 2]);
    this.geometry.faces.push([l + 2, l + 1, l + 3]);
    this.geometry.faces.push([l, l + 1, l + 4]);
    this.geometry.faces.push([l + 4, l + 1, l + 5]);
    this.geometry.faces.push([l + 1, l + 3, l + 5]);
    this.geometry.faces.push([l + 5, l + 3, l + 7]);
    this.geometry.faces.push([l + 3, l + 2, l + 7]);
    this.geometry.faces.push([l + 7, l + 2, l + 6]);
    this.geometry.faces.push([l + 2, l, l + 6]);
    this.geometry.faces.push([l + 6, l, l + 4]);
  }
};
/**
 * Processes a polygon.
 */
URBGEN.Generator.prototype.processPoly = function(poly) {
  if (URBGEN.Util.areaPoly(poly) < this.minPolySize) {
    return [poly];
  }
  this.prepare(poly);
  var newPolys = this.director.execute(this.builder, this.center);
  return newPolys;
};
/**
 *
 */
URBGEN.Generator.prototype.prepare = function(poly) {
  // Set the poly's variables
  poly.minEdgeLength = this.minEdgeLength;
  poly.throughRoadStagger = this.throughRoadStagger;
  poly.regularity1 = this.regularity1;
  poly.regularity2 = this.regularity2;
  if (URBGEN.Util.areaPoly(poly) < this.gridThreshold * this.cityArea) {
    poly.setGridAngle();
  }
  // Set the correct builder
  var horizontalSides = poly.edgeLengths[0] + poly.edgeLengths[3];
  var verticalSides = poly.edgeLengths[1] + poly.edgeLengths[2];
  if (verticalSides > horizontalSides) {
    this.builder = this.horizontalBuilder;
  } else {
    this.builder = this.verticalBuilder;
  }
  this.builder.poly = poly;
};
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// URBGEN.Builder
////////////////////////////////////////////////////////////////////////////////
/**
 * Constructs a builder
 */
URBGEN.Builder = function() {
  this.poly;
  this.origin;
  this.endPoint;
  this.newPoints = [];
};
/**
 * Returns an array of new polys created from this builder's current points.
 */
URBGEN.Builder.prototype.buildPolys = function() {
  var polys = [];
  for (var i = 0; i < this.newPoints.length; i++) {
    var points = this.newPoints[i];
    polys.push(new URBGEN.Poly(points[0], points[1], points[2], points[3]));
  }
  return polys;
};
/**
 * Sets the origin and end points of the new dividing line
 */
URBGEN.Builder.prototype.setPoints = function() {
  var edgeStart = this.poly.corners[0];
  var edgeEnd = this.poly.corners[this.corners[0]];
  var origin;
  var endPoint;
  if (this.poly.gridAngle === undefined) {
    origin = this.pointByRValue(edgeStart, edgeEnd, this.poly.regularity1);
    this.origin = this.addPointToPath(origin, edgeStart, edgeEnd);
    edgeStart = this.poly.corners[this.corners[1]];
    edgeEnd = this.poly.corners[3];
    endPoint = this.pointByRValue(edgeStart, edgeEnd, this.poly.regularity2);
    this.endPoint = this.addPointToPath(endPoint, edgeStart, edgeEnd);
  } else {
    origin = URBGEN.Util.linearInterpolate(edgeStart, edgeEnd, 0.5);
    this.origin = this.addPointToPath(origin, edgeStart, edgeEnd);
    edgeStart = this.poly.corners[this.corners[1]];
    edgeEnd = this.poly.corners[3];
    endPoint = this.pointByAngle(edgeStart, edgeEnd, this.poly.gridAngle);
    this.endPoint = this.addPointToPath(endPoint, edgeStart, edgeEnd);
  }
};
/**
 * Returns a point using the specified angle
 */
URBGEN.Builder.prototype.pointByAngle = function(edgeStart, edgeEnd) {
  // Get the edge's length
  var length = URBGEN.Util.getLineSegmentLength(edgeStart, edgeEnd);
  // Throw an error if the edge is too short
  if (length <= this.poly.minEdgeLength) {
    throw new Error("pointByAngle(): Edge length = " + length + ", " +
      "minEdgeLength = " + this.poly.minEdgeLength);
  }
  var minR = this.poly.minEdgeLength / length;
  var edgeAngle = URBGEN.Util.getAngle(edgeStart, edgeEnd);
  var point = URBGEN.Util.getIntersect(edgeStart, edgeAngle, this.origin, this.poly.gridAngle);
  var r = URBGEN.Util.getPointAsRatio(point, edgeStart, edgeEnd);
  if (r < minR) r = minR;
  if (r > 1 - minR) r = 1 - minR;
  return this.pointByRValue(edgeStart, edgeEnd, r);
};
/**
 * Returns a point between edgeStart and edgeEnd using the specified r value
 */
URBGEN.Builder.prototype.pointByRValue = function(edgeStart, edgeEnd, r) {
  // Get the edge's length
  var length = URBGEN.Util.getLineSegmentLength(edgeStart, edgeEnd);
  // Throw an error if the edge is too short
  if (length <= this.poly.minEdgeLength) {
    throw new Error("pointByRValue(): Edge length = " + length + ", " +
      "minEdgeLength = " + this.poly.minEdgeLength);
  }
  // Work out the legal part of the edge as a range (0 < range < 1)
  var minR = this.poly.minEdgeLength / length;
  var range = 1 - 2 * minR;
  // Use the regularity1 to find a point on this range
  var pointR = range * r + minR;
  // Get the actual point
  var point = URBGEN.Util.linearInterpolate(edgeStart, edgeEnd, pointR);
  return point;
};
/**
 * Returns either a point on the path that lies within the distance, or the
 * original point
 */
URBGEN.Builder.prototype.addPointToPath = function(point, edgeStart, edgeEnd) {
  var path = URBGEN.Util.getDirectedPath(edgeStart, edgeEnd, this.direction);
  var distance = this.poly.throughRoadStagger;
  var nearPoint = URBGEN.Util.checkNearPoints(point, path, distance, false);
  if (nearPoint === point) {
    var neighbors = URBGEN.Util.getNeighbors(point, path);
    URBGEN.Util.insertPoint(point, neighbors.prev, neighbors.nxt);
  }
  return nearPoint;
};
/**
 * Consructs a HorizontalBuilder
 */
URBGEN.Builder.HorizontalBuilder = function() {
  URBGEN.Builder.call(this);
  this.corners = [2, 1];
  this.direction = 2;
};
/**
 * Creates a HorizontalBuilder prototype that inherits from Builder.prototype.
 */
URBGEN.Builder.HorizontalBuilder.prototype
  = Object.create(URBGEN.Builder.prototype);
/**
 * Sets the constructor to refer to HorizontalBuilder
 */
URBGEN.Builder.HorizontalBuilder.prototype.constructor
  = URBGEN.Builder.HorizontalBuilder;
/**
 * Sets this builder's current new points
 */
URBGEN.Builder.HorizontalBuilder.prototype.setNewPoints = function(data) {
  this.origin.neighbors[3] = this.endPoint;
  this.endPoint.neighbors[1] = this.origin;
  this.newPoints = [
    [this.poly.corners[0], this.poly.corners[1], this.origin, this.endPoint],
    [this.origin, this.endPoint, this.poly.corners[2], this.poly.corners[3]]
  ];
};
/**
 * Constructs a VerticalBuilder
 */
URBGEN.Builder.VerticalBuilder = function() {
  URBGEN.Builder.call(this);
  this.corners = [1, 2];
  this.direction = 3;
};
/**
 * Creates a VerticalBuilder prototype that inherits from Builder.prototype.
 */
URBGEN.Builder.VerticalBuilder.prototype
  = Object.create(URBGEN.Builder.prototype);
/**
 * Sets the constructor to refer to VerticalBuilder
 */
URBGEN.Builder.VerticalBuilder.prototype.constructor
  = URBGEN.Builder.VerticalBuilder;
/**
 * Returns this builder's current poly's grid angle + 0.5 * Math.PI
 */
URBGEN.Builder.VerticalBuilder.prototype.getGridAngle = function() {
  return URBGEN.Util.addAngle(this.poly.gridAngle, 0.5);
};
/**
 * Sets this builder's current new points
 */
URBGEN.Builder.VerticalBuilder.prototype.setNewPoints = function(data) {
  this.origin.neighbors[2] = this.endPoint;
  this.endPoint.neighbors[0] = this.origin;
  this.newPoints = [
    [this.poly.corners[0], this.origin, this.poly.corners[2], this.endPoint],
    [this.origin, this.poly.corners[1], this.endPoint, this.poly.corners[3]]
  ];
};
/**
 * Constructs a PlotBuilder
 */
URBGEN.Builder.PlotBuilder = function() {
  URBGEN.Builder.call(this);
  this.innerPaths = [];
  this.outerPaths = [];
  this.outerPoly;
};
/**
 * Creates a VerticalBuilder prototype that inherits from Builder.prototype.
 */
URBGEN.Builder.PlotBuilder.prototype
  = Object.create(URBGEN.Builder.prototype);
/**
 * Sets the constructor to refer to VerticalBuilder
 */
URBGEN.Builder.PlotBuilder.prototype.constructor
  = URBGEN.Builder.PlotBuilder;
/**
 * set points
 */
URBGEN.Builder.PlotBuilder.prototype.setPoints = function() {
  var minL = Math.min(this.poly.edgeLengths[0], this.poly.edgeLengths[1],
    this.poly.edgeLengths[2], this.poly.edgeLengths[3]);
  var length = 10;
  //var minL = Math.min(this.poly.edgeLengths[0], this.poly.edgeLengths[1], this.poly.edgeLengths[2], this.poly.edgeLengths[3]);
  var innerInset = Math.min(Math.floor(minL / 4), 15);
  var innerPoly = URBGEN.Util.insetPoly(this.poly, innerInset);
  innerPoly.makeSimple();
  this.outerPoly = new URBGEN.Util.insetPoly(this.poly, 3);
  this.outerPoly.makeSimple();
  // Get the inner edges
  var innerEdges = [
    [innerPoly.corners[0], innerPoly.corners[1]],
    [innerPoly.corners[1], innerPoly.corners[3]],
    [innerPoly.corners[0], innerPoly.corners[2]],
    [innerPoly.corners[2], innerPoly.corners[3]]
  ];
  // Get the outer edges as proxies of the original outer edges
  var outerEdges = [
    [this.outerPoly.corners[0], this.outerPoly.corners[1]],
    [this.outerPoly.corners[1], this.outerPoly.corners[3]],
    [this.outerPoly.corners[0], this.outerPoly.corners[2]],
    [this.outerPoly.corners[2], this.outerPoly.corners[3]]
  ];
  // Get the proxy edges
  for (var i = 0; i < outerEdges.length; i++) {
    //var outerEdge = outerEdges[i];
    var innerLength = innerPoly.edgeLengths[i];
    outerEdges[i] = URBGEN.Util.proxyLineSegment(outerEdges[i][0], outerEdges[i][1], innerLength);
  }
  // Get the paths
  var innerPaths = [];
  var outerPaths = [];
  for (var j = 0; j < outerEdges.length; j++) {
    length = (Math.random() * (length / 2)) + length;
    innerPaths.push(URBGEN.Util.divideLine(innerEdges[j][0], innerEdges[j][1], length));
    outerPaths.push(URBGEN.Util.divideLine(outerEdges[j][0], outerEdges[j][1], length));
  }
  this.innerPaths = innerPaths;
  this.outerPaths = outerPaths;
};
/**
 * Sets this builder's current new points
 */
URBGEN.Builder.PlotBuilder.prototype.setNewPoints = function(data) {
  var newPoints = [];
  for (var i = 0; i < this.innerPaths.length; i++) {
    for (var j = 0; j < this.innerPaths[i].length - 1; j++) {
      newPoints.push([
        this.outerPaths[i][j], this.outerPaths[i][j + 1],
          this.innerPaths[i][j], this.innerPaths[i][j + 1]
      ]);
    }
  }
  // add the corner plots
  newPoints.push([this.outerPoly.corners[0], this.outerPaths[0][0],
    this.outerPaths[2][0], this.innerPaths[0][0]]);
  newPoints.push([this.outerPaths[0][this.outerPaths[0].length - 1],
    this.outerPoly.corners[1], this.innerPaths[1][0], this.outerPaths[1][0]]);
  newPoints.push([this.outerPaths[2][this.outerPaths[2].length - 1],
    this.innerPaths[2][this.innerPaths[2].length - 1], this.outerPoly.corners[2],
      this.outerPaths[3][0]]);
  newPoints.push([this.innerPaths[1][this.innerPaths[1].length - 1],
    this.outerPaths[1][this.outerPaths[1].length - 1],
      this.outerPaths[3][this.outerPaths[3].length - 1], this.outerPoly.corners[3]]);
  this.newPoints = newPoints;
};
/**
 * Builds the new polys
 */
URBGEN.Builder.PlotBuilder.prototype.buildPolys = function() {
  var polys = [];
  for (var i = 0; i < this.newPoints.length; i++) {
    var points = this.newPoints[i];
    var poly = new URBGEN.Poly(points[0], points[1], points[2], points[3]);
    if (URBGEN.Util.areaPoly(poly) > 0) {
      polys.push(poly);
    }
  }
  return polys;
};
/**
 * Constructs a director
 */
URBGEN.Builder.Director = function() {
  
};
/**
 * Invokes the builder
 */
URBGEN.Builder.Director.prototype.execute = function(builder) {
  builder.setPoints();
  builder.setNewPoints();
  return builder.buildPolys();
};

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// URBGEN.Util
////////////////////////////////////////////////////////////////////////////////
URBGEN.Util = {};
/**
 * Returns the length of the line segment p0p1.
 */
URBGEN.Util.getLineSegmentLength = function(p0, p1) {
  var length = Math.sqrt(Math.pow((p1.x - p0.x), 2)
    + Math.pow((p1.y - p0.y), 2));
    return length;
};
/**
 * Returns the total length of the line segments described by the path.
 */
URBGEN.Util.getPathLength = function(path) {
  var length = 0;
  for (var i = 0; i < path.points.length - 1; i++) {
    length += URBGEN.Util.getLineSegmentLength(path.points[i], path.points[i + 1]);
  }
  return length;
};
/**
 * Finds a point on the line segment p0p1 which is the specified length along
 * the line.
 */
URBGEN.Util.linearInterpolateByLength = function(p0, p1, length) {
  var totalLength = URBGEN.Util.getLineSegmentLength(p0, p1);
  if (length > totalLength) {
    return p1;
  }
  var r = length / totalLength;
  return URBGEN.Util.linearInterpolate(p0, p1, r);
};
/**
 * Finds a point on the line segment p0p1.
 */
URBGEN.Util.linearInterpolate = function(p0, p1, r) {
  var x = (1 - r) * p0.x + r * p1.x;
  var y = (1 - r) * p0.y + r * p1.y;
  var z = (1 - r) * p0.z + r * p1.z;
  return new URBGEN.Point(x, y, z);
};
/**
 * Returns the angle of the line segment p0p1 in radians
 */
URBGEN.Util.getAngle = function(p0, p1) {
  var x1 = p0.x;
  var x2 = p1.x;
  var y1 = p0.y;
  var y2 = p1.y;
  if (y1 === y2) {
    if (x2 > x1) {return 0;} else {return Math.PI;}
  }
  var angle = Math.atan2((y2 - y1), (x2 - x1));
  if (y2 > y1) {
    return angle;
    
  } else {
    return (2 * Math.PI) + angle;
  }
};
/**
 * Returns the angle of the grid axis that is closest to being perpendicular to
 * the line through p0 and p1.
 */
URBGEN.Util.getGridAngle = function(p0, p1, angle) {
  // Get the angle as a multiple of Pi adjusted to standard x y axes
  var angle = URBGEN.Util.getAngle(p0, p1) / Math.PI - angle;
  // Find which axis a line at this angle is closest to (0 or 4, 1, 2, 3)
  var axis = Math.round(angle * 2);
  // If even, the line is closest to x axis, so return the y axis of the grid
  if (axis % 2 === 0) {
    return Math.PI * (angle + 0.5);
  } else {
    return Math.PI * angle;
  }
};
/**
 * Adds the specified dA (dA * Pi) to the specified angle. The result is
 * normalized to a value between 0 and 2 * Pi radians;
 */
URBGEN.Util.addAngle = function(angle, dA) {
  var newAngle = (angle + dA * Math.PI) % (2 * Math.PI);
  if (newAngle < 0) {
    newAngle += 2 * Math.PI;
  }
  return newAngle;
  
};
/**
 * Returns a value that represents the specified point's location on the line
 * through p0 and p1, relative to the line segment p0p1.
 */
URBGEN.Util.getPointAsRatio = function(point, p0, p1) {
  var d1;
  var d2;
  // If the line is parallel with the y-axis, use the difference in y values
  if (p0.x === p1.x) {
    d1 = point.y - p0.y;
    d2 = p1.y - p0.y;
  } else { // otherwise, use the difference in x values
    d1 = point.x - p0.x;
    d2 = p1.x - p0.x;
  }
  return d1 / d2;
};
/**
 * Returns the area of the specified poly.
 */
URBGEN.Util.areaPoly = function(poly) {
  var x0 = poly.corners[3].x - poly.corners[0].x;
  var y0 = poly.corners[3].y - poly.corners[0].y;
  var x1 = poly.corners[1].x - poly.corners[2].x;
  var y1 = poly.corners[1].y - poly.corners[2].y;
  var area = Math.abs((x0 * y1 - x1 * y0) / 2);
  return area;
};
/**
 * Returns an array of points representing a path from p0 to p1 in the specified
 * direction. If p1 is not found in maxSteps iterations, returns false. If
 * maxSteps is not specified, defaults to 1000.
 */
URBGEN.Util.getDirectedPath = function(p0, p1, direction, maxSteps) {
  var points = [p0];
  var i = 0;
  while(points[i] !== p1) {
    points.push(points[i].neighbors[direction]);
    i++;
    if (i === 1000) return undefined;
  }
  return points;
};
/**
 * Given two lines, defined by a point on the line and the angle of the line,
 * returns the point at which the two lines intersect. If the lines are colinear,
 * returns p1.
 */
URBGEN.Util.getIntersect = function(p0, a0, p1, a1) {
  var m0 = Math.tan(a0);
  var m1 = Math.tan(a1);
  var x;
  var y;
  var point;
  // Check if the lines are colinear
  if (m0 === m1) return p0;
  // Check if either line is colinear with the y axis
  if (m0 === Infinity) {
    x = p0.x;
    y = x * m1 + (p1.y - m1 * p1.x);
  } else if (m1 === Infinity) {
    x = p1.x;
    y = x * m0 + (p0.y - m0 * p0.x);
  // Otherwise, find the intersection point
  } else {
    x = (p1.y - p0.y + (m0 * p0.x) - (m1 * p1.x)) / (m0 - m1);
    y = m1 * (x - p1.x) + p1.y;
  }
  point = new URBGEN.Point(x, y, 0);
  return point;
};
/**
 * Returns a path of equidistant (length) points on the linesegment pop1
 */
URBGEN.Util.divideLine = function(p0, p1, length) {
  if (p0.neighbors.indexOf(p1) === -1) {
    throw new Error("Can't divide line, p0 and p1 are not neighbors");
  }
  var points = [p0];
  var i = 0;
  var currentLineLength = URBGEN.Util.getLineSegmentLength(points[i], p1);
  while (length * 2 <= currentLineLength) {
    points.push(URBGEN.Util.linearInterpolateByLength(points[i], p1, length));
    i++;
    currentLineLength = URBGEN.Util.getLineSegmentLength(points[i], p1);
  }
  points.push(p1);
  return points;
};
/**
 * Returns a point representing the unit vector from p0 in the specified angle
 */
URBGEN.Util.unitVectorByAngle = function(p0, angle) {
  var dY = Math.tan(angle);
  var point = new URBGEN.Point(p0.x + 1, p0.y + dY);
  return URBGEN.Util.unitVector(p0, point);
};
/**
 * Returns a point representing the unit vector for the line p0p1
 */
URBGEN.Util.unitVector = function(p0, p1) {
  //TODO which implementation?
  
  // 1
  /*
  var dX = p1.x - p0.x;
  var dY = p1.y - p0.y;
  if (dX === 0 && dY === 0) {
    var point = new URBGEN.Point(0, 0, 0);
    return point;
  }
  var f = 1 / URBGEN.Util.getLineSegmentLength(p0, p1);
  dX *= f;
  dY *= f;
  var point = new URBGEN.Point(dX, dY, 0);
  return point;
  */
  
  // 2
  var point = URBGEN.Util.linearInterpolateByLength(p0, p1, 1);
  var unit = new URBGEN.Point(point.x - p0.x, point.y - p0.y, 0);
  return unit;
  
};
/**
 * Returns the unit normal for the line segments p0p1
 */
URBGEN.Util.unitNormal = function(p0, p1) {
  var unitVector = URBGEN.Util.unitVector(p0, p1);
  
  var unitNormal = new URBGEN.Point(-unitVector.y, unitVector.x, 0);
  return unitNormal;
};
/**
 * Returns a path representing the (right) offset of the line seg p0p1
 */
URBGEN.Util.offsetLineSegment = function(p0, p1, distance) {
  var unitNormal = URBGEN.Util.unitNormal(p0, p1);
  var p0Offset = new URBGEN.Point();
  p0Offset.setValues(p0);
  p0Offset.x += unitNormal.x * distance;
  p0Offset.y += unitNormal.y * distance;
  var p1Offset = new URBGEN.Point();
  p1Offset.setValues(p1);
  p1Offset.x += unitNormal.x * distance;
  p1Offset.y += unitNormal.y * distance;
  return [p0Offset, p1Offset];
};
/**
 * Insets the specified poly
 */
URBGEN.Util.insetPoly = function(poly, length) {
  // Get the edges
  var edges = [
    [poly.corners[0], poly.corners[1]],
    [poly.corners[1], poly.corners[3]],
    [poly.corners[3], poly.corners[2]],
    [poly.corners[2], poly.corners[0]]
  ];
  // Get the offset edges and angles
  var offsetEdges = [];
  var angles = [];
  for (var i = 0; i < edges.length; i++) {
    offsetEdges.push(URBGEN.Util.offsetLineSegment(edges[i][0], edges[i][1], length))
    angles.push (URBGEN.Util.getAngle(offsetEdges[i][0], offsetEdges[i][1]));
  }
  // Find the new corners
  var tl = URBGEN.Util.getIntersect(offsetEdges[0][0], angles[0], offsetEdges[3][0], angles[3]);
  var tr = URBGEN.Util.getIntersect(offsetEdges[1][0], angles[1], offsetEdges[0][0], angles[0]);
  var bl = URBGEN.Util.getIntersect(offsetEdges[3][0], angles[3], offsetEdges[2][0], angles[2]);
  var br = URBGEN.Util.getIntersect(offsetEdges[2][0], angles[2], offsetEdges[1][0], angles[1]);
  return new URBGEN.Poly(tl, tr, bl, br);
};
/**
 * Sets the neighbor relations of p0 and p1 with the newPoint. If p0 and p1 are
 * not neighbors, returns false.
 */
URBGEN.Util.insertPoint = function(newPoint, p0, p1) {
  var direction = p0.neighbors.indexOf(p1);
  var oppDirection = (direction + 2) % 4;
  p1.neighbors[oppDirection] = newPoint;
  p0.neighbors[direction] = newPoint;
  newPoint.neighbors[direction] = p1;
  newPoint.neighbors[oppDirection] = p0;
  return true;
}
/**
 * Adds the specified point to the specified edge
 * NOT TESTED, MAY NOT USE
 */
URBGEN.Util.addPointToEdge = function(point, edge) {
  var neighbors = URBGEN.Util.getNeighbors(point, edge.points);
  var index = edge.points.indexOf(neighbors.nxt);
  edge.points.splice(index, 0, point);
  return URBGEN.Util.insertPoint(point, neighbors.prev, neighbors.nxt);
};
/**
 * Returns the specified point's neighbors among the specified points.
 */
URBGEN.Util.getNeighbors = function(point, points) {
  var neighbors = {
    prev: undefined,
    nxt: undefined
  };
  if (points.length === 2) {
    neighbors.prev = points[0];
    neighbors.nxt = points[1];
    return neighbors;
  }
  // Find the point as a ratio of the line
  var pointR = URBGEN.Util.getPointAsRatio(point, points[0],
    points[points.length - 1]);
  // if the point lies beyond either end of the path, throw error
  if (pointR <= 0 || pointR >= 1) {
    throw new Error("Can't determine neighbors. Point's r value = " + pointR);
  }
  for (var i = 1; i < points.length; i++) {
    var currPoint = points[i];
    var r = URBGEN.Util.getPointAsRatio(currPoint, points[0],
      points[points.length - 1]);
    //TODO what if r === pointR? ie, the point is identical to one on the path?
    if (r > pointR) {
      neighbors.prev = points[i - 1];
      neighbors.nxt = points[i];
      return neighbors;
    }
  }
  return false;
};
/**
 * Returns a point on the specified edge that is within the specified distance
 * of the specified point. If includeEnds is true, then the start and end points
 * of the edge will be included in the search. If no such point exists, returns
 * the original point.
 */
URBGEN.Util.checkNearPoints = function(point, points, distance, includeEnds) {
  var neighbors = URBGEN.Util.getNeighbors(point, points);
  var d0 = Math.abs(URBGEN.Util.getLineSegmentLength(neighbors.prev, point));
  var d1 = Math.abs(URBGEN.Util.getLineSegmentLength(point, neighbors.nxt));
  if (d0 < distance && d0 <= d1) {
    if (neighbors.prev === points[0]) {
      if (includeEnds) {
        return points[0];
      }
    } else {
      return neighbors.prev;
    }
  } else if (d1 < distance) {
    if (neighbors.nxt === points[points.length - 1]) {
      if (includeEnds) {
        return points[points.length - 1];
      }
    } else {
      return neighbors.nxt;
    }
  }
  return point;
};
/**
 * Returns the point in points that has the shortest straight line distance to
 * target. If any points have equal distances to target, returns the point which
 * comse first in points.
 */
URBGEN.Util.nearest = function(points, target) {
  var index = 0;
  var shortest = URBGEN.Util.getLineSegmentLength(points[0], target);
  for (var i = 1; i < points.length; i++) {
    var length = URBGEN.Util.getLineSegmentLength(points[i], target);
    if (length < shortest) {
      index = i;
      shortest = length;
    }
  }
  return points[index];
}
/**
 * Returns a subsegment of the line segment p0p1, of th specified length
 */
URBGEN.Util.proxyLineSegment = function(p0, p1, length) {
  var direction = p0.neighbors.indexOf(p1);
  var oppDirection = (direction + 2) % 4;
  var p0p1Length = URBGEN.Util.getLineSegmentLength(p0, p1);
  if (p0p1Length <= length) {
    throw new Error("Can't make proxy line segment. p0p1Length = "
      + p0p1Length + ", requested proxy length = " + length);
  }
  var dLength = p0p1Length - length;
  var start = URBGEN.Util.linearInterpolateByLength(p0, p1, dLength / 2);
  var end = URBGEN.Util.linearInterpolateByLength(p1, p0, dLength / 2);
  start.neighbors[direction] = end;
  end.neighbors[oppDirection] = start;
  return [start, end];
};

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// URBGEN.Math
////////////////////////////////////////////////////////////////////////////////
URBGEN.Math = {};
/**
 * Constructs a psuedorandom number generator with the specified seed
 */
URBGEN.Math.random = function(seed) {
  this.seed = seed || Math.random();
};
/**
 * Returns the next psuedorandom number (0 - 1) for this prng
 */
URBGEN.Math.random.prototype.next = function() {
  this.seed = (this.seed * 9301 + 49297) % 233280;
  return this.seed / 233280;
};