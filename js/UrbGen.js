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
  this.x = x;
  this.y = y;
  this.z = z;
  this.anchored = false;
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
  this.atomic = false;
};
/**
 * DEPRECATED
 * Defines an edge with the specified start and end points
 */
URBGEN.LineSegment = function(p0, p1, direction) {
  this.start = p0;
  this.end = p1;
  this.direction = direction;
};
/**
 * DEPRECATED
 * Defines an edge pair with the specified edges
 */
URBGEN.LineSegPair = function(l0, l1) {
  this.l0 = l0;
  this.l1 = l1;
};
/**
 * DEPRECATED
 */
URBGEN.LineSegPair.prototype.getShort = function() {
  var l0Length = URBGEN.Util.getLength(l0.start, l0.end);
  var l1Length = URBGEN.Util.getLength(l1.start, l1.end);
  if (l0Length <= l1Length) {
    return l0;
  }
  return l1;
};
/**
 * Defines an edge
 */
URBGEN.Edge = function(points, direction) {
  this.points = points;
  this.direction = direction;
  this.angle = URBGEN.Util.getAngle(this.points[0],
    this.points[this.points.length - 1]);
};
/**
 * Defines an edge pair with the specified edges
 */
URBGEN.EdgePair = function(e0, e1) {
  this.e0 = e0;
  this.e1 = e1;
};
/**
 * Returns the shortest of the two edgeS that make up this edge pair
 */
URBGEN.EdgePair.prototype.getShort = function() {
  var e0Length = URBGEN.Util.getLength(this.e0.points[0],
    this.e0.points[this.e0.points.length - 1]);
  var e1Length = URBGEN.Util.getLength(this.e1.points[0],
    this.e1.points[this.e1.points.length - 1]);
  if (e0Length <= e1Length) {
    return this.e0;
  }
  return this.e1;
};
/**
 * Returns the longest of the two edges that make up this edge pair
 */
URBGEN.EdgePair.prototype.getLong = function() {
  var e0Length = URBGEN.Util.getLength(this.e0.points[0],
    this.e0.points[this.e0.points.length - 1]);
  var e1Length = URBGEN.Util.getLength(this.e1.points[0],
    this.e1.points[this.e1.points.length - 1]);
  if (e0Length > e1Length) {
    return this.e0;
  }
  return this.e1;
};
/**
 * Returns the edge in this edge pair composed of the largest number of segments
 */
URBGEN.EdgePair.prototype.getMostSegmented = function() {
  if (this.e0.points.length >= this.e1.points.length) {
    return this.e0;
  }
  return this.e1;
};
/**
 * Returns the opposite edge to the specified edge
 */
URBGEN.EdgePair.prototype.getOpposite = function(edge) {
  if (edge === this.e0) {
    return this.e1;
  }
  return this.e0;
};
/**
 * Cnstructs a controller
 */
URBGEN.Control = function() {
  this.gridBuilder = new URBGEN.Builder.GridBuilder();
  this.horizontalBuilder = new URBGEN.Builder.HorizontalBuilder();
  this.verticalBuilder = new URBGEN.Builder.VerticalBuilder();
  this.builder;
};
/**
 * Processes the specified polys
 */
URBGEN.Control.prototype.processPolys = function(polys) {
  var newPolys = [];
  var polysChanged = false;
  for (var i = 0; i < polys.length; i++) {
    if (polys[i].atomic) {
      newPolys.push(polys[i]);
    } else if (URBGEN.Util.getArea(polys[i]) < MIN_AREA) { //TODO what is MIN_AREA!?
      polys[i].atomic = true;
      newPolys.push(polys[i]);
    } else {
      this.prepareBuilder(polys[i]);
      builder.setValues();
      builder.setNewPoints();
      replacementPolys = builder.buildPolys();
      for (var j = 0; j < dividePolys.length; j++) {
        newPolys.push(replacementPolys[j]);
      }
      polysChanged = true;
    }
  }
  if (polysChanged) {
    return processPolys(newPolys);
  }
  return newPolys;
};
/**
 * Sets the correct builder for the specified poly
 */
URBGEN.Control.prototype.prepareBuilder = function(poly) {
  var random = Math.random();
  var r = Math.random() * 0.8 + 0.1;
  var p0 = poly.corners[0];
  var p1 = poly.corners[1];
  var p2 = poly.corners[2];
  var p3 = poly.corners[3];
  if (random < 0) {
    this.builder = this.horizontalBuilder;
    this.builder.origin = URBGEN.Util.linearInterpolate(p0, p2, r);
    this.builder.poly = poly;
    this.builder.angles = [URBGEN.Util.getGridAngle(p0, p2)];
  } else if (random < 0) {
    this.builder = this.verticalBuilder;
    this.builder.origin = URBGEN.Util.linearInterpolate(p0, p1, r);
    this.builder.poly = poly;
    this.builder.angles = [URBGEN.Util.getGridAngle(p0, p1)];
  } else {
    this.builder = this.gridBuilder;
    this.builder.origin = URBGEN.Util.getPopCenter(poly);
    this.builder.poly = poly;
    this.builder.angles = [
      URBGEN.Util.getGridAngle(p0, p1),
      URBGEN.Util.getGridAngle(p0, p2),
      URBGEN.Util.getGridAngle(p2, p3),
      URBGEN.Util.getGridAngle(p1, p3)
    ];
  }
};

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// URBGEN.Builder
////////////////////////////////////////////////////////////////////////////////
URBGEN.Builder = function() {
  /** The poly being processed */
  this.poly;
  /** The origin point for new lines */
  this.origin;
  /** The edges this builder will divide */
  this.edges = [];
  /** The angles used for dividing edges */
  this.angles = [];
  /** The new points to be used for division */
  this.newPoints;
};
URBGEN.Builder.prototype.setValues = function(poly) {
  
};
/**
 * Abstract
 */
URBGEN.Builder.prototype.setNewPoints = function() {};
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
 * Consructs a grid builder
 */
URBGEN.Builder.GridBuilder = function() {
  URBGEN.Builder.call(this);
};
/**
 * Creates a GridBuilder prototype that inherits from Builder.prototype.
 */
URBGEN.Builder.GridBuilder.prototype = Object.create(URBGEN.Builder.prototype);
/**
 * Sets the constructor to refer to GridBuilder
 */
URBGEN.Builder.GridBuilder.prototype.constructor = URBGEN.Builder.GridBuilder;
/**
 * Returns a start point and end point using the specified poly's grid angle. If
 * the poly's grid angle cannot be used, sets the poly's grid angle to an angle
 * as close to the original as possible and uses this new angle to find points.
 */
URBGEN.Builder.GridBuilder.prototype.setNewPoints = function() {
  var center = this.origin;
  var points = [0, 0, 0, 0];
  var edges = [
    new URBGEN.Edge([this.poly.corners[0], this.poly.corners[1]], 3),
    new URBGEN.Edge([this.poly.corners[0], this.poly.corners[2]], 2),
    new URBGEN.Edge([this.poly.corners[2], this.poly.corners[3]], 3),
    new URBGEN.Edge([this.poly.corners[1], this.poly.corners[3]], 2)
  ];
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    var intersect = URBGEN.Util.getIntersect(edge.points[0], edge.angle, center, this.angles[i]);
    var r = URBGEN.Util.getPointAsRatio(intersect, edge.points[0], edge.points[edge.points.length - 1]);
    if (r > 0.9) {
      r = 0.9;
    }
    if (r < 0.1) {
      r = 0.1;
    }
    intersect = URBGEN.Util.linearInterpolate(edge.points[0], edge.points[edge.points.length - 1], r);
    intersect = URBGEN.Util.checkNearPoints(edge, intersect, 50, false);
    points[i] = intersect;
    center.neighbors[i] = points[i];
    points[i].neighbors[(i + 2) % 4] = center;
  }
  this.newPoints = [
    [poly.corners[0], points[0], points[1], center],
    [points[0], poly.corners[1], center, points[3]],
    [points[1], center, poly.corners[2], points[2]],
    [center, points[3], points[2], poly.corners[3]]
  ];
};
/**
 * Consructs a HorizontalBuilder
 */
URBGEN.Builder.HorizontalBuilder = function() {
  URBGEN.Builder.call(this);
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
 * Returns n {2, 4} points using the specified poly's targets and center.
 */
URBGEN.Builder.HorizontalBuilder.prototype.setNewPoints = function() {
  var p0 = poly.corners[0];
  var p1 = poly.corners[1];
  var p2 = poly.corners[2];
  var p3 = poly.corners[3];
  var edge = new URBGEN.Edge([p0, p1], 2);
  var p = this.origin;
  var pAngle = this.angles[0];
  var p1Angle = URBGEN.Util.getAngle(p1, p3);
  var q = URBGEN.Util.getIntersect(p, pAngle, p1, p1Angle);
  var r = URBGEN.Util.getPointAsRatio(q, p1, p3);
  if (r > 0.9) {
    r = 0.9;
  }
  if (r < 0.1) {
    r = 0.1;
  }
  q = URBGEN.Util.linearInterpolate(p1, p3, r);
  q = URBGEN.Util.checkNearPoints(edge, q, 50, false);
  URBGEN.Util.insertPoint(p0, p2, p);
  URBGEN.Util.insertPoint(p1, p3, q);
  p.neighbors[3] = q;
  q.neighbors[2] = p;
  this.newPoints = [
    [p0, p1, p, q],
    [p, q, p2, p3]
  ];
};
/**
 * Constructs a VerticalBuilder
 */
URBGEN.Builder.VerticalBuilder = function() {
  URBGEN.Builder.call(this);
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
 * Given a poly that is not a quad, returns the first segment end point of the
 * most segmented edge, and a point on the opposite edge. The latter point is
 * either the first segment end (if the opposite edge has segments) or else a
 * point determined by an appropriate method.
 */
URBGEN.Builder.VerticalBuilder.prototype.setNewPoints = function() {
  var p0 = poly.corners[0];
  var p1 = poly.corners[1];
  var p2 = poly.corners[2];
  var p3 = poly.corners[3];
  var edge = new URBGEN.Edge([p0, p1], 3);
  var p = this.origin;
  var pAngle = this.angles[0];
  var p2Angle = URBGEN.Util.getAngle(p2, p3);
  var q = URBGEN.Util.getIntersect(p, pAngle, p2, p2Angle);
  var r = URBGEN.Util.getPointAsRatio(q, p2, p3);
  if (r > 0.9) {
    r = 0.9;
  }
  if (r < 0.1) {
    r = 0.1;
  }
  q = URBGEN.Util.linearInterpolate(p2, p3, r);
  q = URBGEN.Util.checkNearPoints(edge, q, 50, false);
  URBGEN.Util.insertPoint(p0, p1, p);
  URBGEN.Util.insertPoint(p2, p3, q);
  p.neighbors[2] = q;
  q.neighbors[0] = p;
  this.newPoints = [
    [p0, p, p2, q],
    [p, p1, q, p3]
  ];
};

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// URBGEN.Util
////////////////////////////////////////////////////////////////////////////////
URBGEN.Util = {};
/**
 * Returns the length of a line segment(s) between the two specified points
 */
URBGEN.Util.getLength = function(p0, p1) {
  if (p0.neighbors.indexOf(p1) === -1) {
    var direction = URBGEN.Util.getDirection(p0, p1);
    if (direction === false) {
      return NaN;
    }
    var path = URBGEN.Util.getDirectedPath(p0, p1, direction);
    return URBGEN.Util.getPathLength(path);
  }
  return URBGEN.Util.getLineSegmentLength(p0, p1);
};
/**
 * Returns the length of the line segment p0p1.
 */
URBGEN.Util.getLineSegmentLength = function(p0, p1) {
  var length = Math.sqrt(Math.pow((p1.x - p0.x), 2)
    + Math.pow((p1.y - p0.y), 2));
    return length;
};
/**
 * Returns the total length of the line segments described by path.
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
 * Finds a point on the line segment p0p1 using cosine interpolation (for y value)
 */
URBGEN.Util.cosineInterpolate = function(p0, p1, r) {
  r2 = (-1 * Math.cos(Math.PI * r) / 2) + 0.5;
  var x = (1 - r) * p0.x + r * p1.x;
  var y = (1 - r2) * p0.y + r2 * p1.y;
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
  /* console.debug("the angle in degrees from + x axis = " + angle * (180/Math.PI)); */
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
URBGEN.Util.getGridAngle = function(p0, p1) {
  // Get the angle as a multiple of Pi adjusted to standard x y axes
  var angle = URBGEN.Util.getAngle(p0, p1) / Math.PI - globalCityGridX;
  // Find which axis a line at this angle is closest to (0 or 4, 1, 2, 3)
  var axis = Math.round(angle * 2);
  // If even, the line is closest to x axis, so return the y axis of the grid
  if (axis % 2 === 0) {
    return Math.PI * (globalCityGridX + 0.5);
  } else {
    return Math.PI * globalCityGridX;
  }
};
/**
 * Adds the specified dA (dA * Pi) to the specified angle. The result is
 * normalized to a value between 0 and 2 * Pi radians;
 */
URBGEN.Util.addAngle = function(angle, dA) {
  var newAngle = (angle + dA * Math.PI) % (2 * Math.PI);
  return newAngle;
  
};
/**
 * Returns a point a distance r along the line segment between p0 and it's
 * neighbor in the specified direction. r must be in range 0 - 1 (exclusive).
 * direction must be either 2 or 3.
 */
URBGEN.Util.getNewPoint = function(point, direction, r) {
  if (2 > direction || direction > 3) {
    return undefined;
  }
  if (0 >= r || r >= 1) {
    return undefined;
  }
  var p = point;
  var q = point.neighbors[direction];
  var newPoint = URBGEN.Util.linearInterpolate(p, q, r);
  q.neighbors[direction - 2] = newPoint;
  p.neighbors[direction] = newPoint;
  newPoint.neighbors[direction] = q;
  newPoint.neighbors[direction - 2] = p;
  return newPoint;
};
/**
 * Returns a value that represents the specified point's location on the line
 * through p0 and p1, relative to the line segment p0p1.
 */
URBGEN.Util.getPointAsRatio = function(point, p0, p1) {
  var d1 = point.x - p0.x;
  var d2 = p1.x - p0.x;
  return d1 / d2;
};
/**
 * Returns the shortest of two line segments. If they are the same length, returns the
 * l1.
 */
URBGEN.Util.getShortest = function(l1, l2) {
  // TODO
 };
/**
 * Returns the area of the triangle specified by 3 points
 */
URBGEN.Util.areaTri = function(p0, p1, p2) {
  var area = p0.x * (p1.y - p2.y) + p1.x * (p2.y - p0.y) + p2.x * (p0.y - p1.y);
  return area;
};
/**
 * Returns the area of the specified quad.
 */
URBGEN.Util.areaQuad = function(quad) {
  var x0 = quad.corners[3].x - quad.corners[0].x;
  var y0 = quad.corners[3].y - quad.corners[0].y;
  var x1 = quad.corners[1].x - quad.corners[2].x;
  var y1 = quad.corners[1].y - quad.corners[2].y;
  var area = Math.abs((x0 * y1 - x1 * y0) / 2);
  return area;
};
/**
 * Returns an array of points representing a path from p0 to p1 in the specified
 * direction. If p1 is not found in maxSteps iterations, returns false. If
 * maxSteps is not specified, defaults to 100.
 */
URBGEN.Util.getDirectedPath = function(p0, p1, direction, maxSteps) {
  var points = [p0];
  if (maxSteps === undefined) {
    maxSteps = 100;
  }
  for (var i = 0; i < maxSteps; i++) {
    if (points[i].neighbors[direction] !== 0) {
      var point = points[i].neighbors[direction];
      points.push(point);
      if (point === p1) {
        var path = new URBGEN.Edge(points, direction);
        return path;
      }
    } else {
      return false;
    }
  }
};
/**
 * Returns the direction (0 - 3) in which you must travel from p0 to reach p1.
 * If p1 is not found in maxSteps (defaults to 100) iterations, returns false.
 */
URBGEN.Util.getDirection = function(p0, p1, maxSteps) {
  var points = [p0, p0, p0, p0];
  if (maxSteps === undefined) {
    maxSteps = 100;
  }
  for (var i = 0; i < maxSteps; i++) {
    for (var j = 0; j < 4; j++) {
      var point = points[j].neighbors[j];
      if (point !== 0) {
        if (point === p1) {
          return j;
        }
        points[j] = point;
      }
    }
  }
  return false;
};
/**
 * Calls the appropriate method to divide the specified poly
 */
URBGEN.Util.dividePoly = function(poly, points, direction) {
  if (points.length === 2) {
    return URBGEN.Util.dividePoly2(poly, points, direction);
  }
  return URBGEN.Util.dividePoly4(poly, points);
};
/**
 * Divides the specified quad into two quads, by inserting a line connecting
 * opposite edges, using rStart and rEnd to determine the division points and
 * direction (2 or 3) to determine which of the quad's top left point's
 * neighbors is the first edge to divide.
 */
URBGEN.Util.dividePoly2 = function(poly, newPoints, direction) {
  var newPolys = [];
  /* TODO might not be needed
  if (URBGEN.Util.testForQuad(poly).isQuad) {
    newPolys.push(poly);
    return newPolys;
  }
  */
  if (3 < direction || direction < 2) {
    newPolys.push(poly);
    return newPolys;
  }
  // Find the perpendicular direction
  var perpDirection = ((direction + 1) % 2) + 2;
  // Find the corners
  var p0 = poly.corners[0];
  var p1 = p0.neighbors[direction];
  var p2 = p0.neighbors[perpDirection];
  var p3 = p2.neighbors[direction];
  // Get refs to the new points
  var p = newPoints[0];
  var q = newPoints[1];
  // If the new points have not already been inserted, insert them
  if (p0.neighbors[direction] !== p) {
    URBGEN.Util.insertPoint(p, p0, p1);
  }
  if (p2.neighbors[direction] !== q) {
    URBGEN.Util.insertPoint(q, p2, p3);
  }
  // Set the new point's as neighbors
  p.neighbors[perpDirection] = q;
  q.neighbors[perpDirection - 2] = p;
  // Make two new quads
  var q0;
  var q1;
  if (direction === 3) {
    q0 = new URBGEN.Poly(p0, p, p2, q);
    q1 = new URBGEN.Poly(p, p1, q, p3);
  } else {
    q0 = new URBGEN.Poly(p0, p2, p, q);
    q1 = new URBGEN.Poly(p, q, p1, p3);
  }
  newPolys.push(q0);
  newPolys.push(q1);
  return newPolys;
};
/**
 * Divides the specified quad into four quads, by adding new points to each edge
 * and connecting these new points to the center.
 */
URBGEN.Util.dividePoly4 = function(poly, newPoints) {
  var newPolys = [];
  if (!URBGEN.Util.testForQuad(poly).isQuad) {
    newPolys.push(poly);
    return newPolys;
  }
  var center = URBGEN.Util.getPopCenter(poly);
  // Find the corners of the poly
  var p0 = poly.corners[0];
  var p1 = poly.corners[1];
  var p2 = poly.corners[2];
  var p3 = poly.corners[3];
  // Insert the new points
  URBGEN.Util.insertPoint(newPoints[0], p0, p1);
  URBGEN.Util.insertPoint(newPoints[1], p0, p2);
  URBGEN.Util.insertPoint(newPoints[2], p2, p3);
  URBGEN.Util.insertPoint(newPoints[3], p1, p3);
  // Set the new points and the center as neighbors
  newPoints[0].neighbors[2] = center;
  newPoints[1].neighbors[3] = center;
  newPoints[2].neighbors[0] = center;
  newPoints[3].neighbors[1] = center;
  center.neighbors[0] = newPoints[0];
  center.neighbors[1] = newPoints[1];
  center.neighbors[2] = newPoints[2];
  center.neighbors[3] = newPoints[3];
  // Make 4 new quads
  var q0 = new URBGEN.Poly(p0, newPoints[0], newPoints[1], center);
  var q1 = new URBGEN.Poly(newPoints[0], p1, center, newPoints[3]);
  var q2 = new URBGEN.Poly(newPoints[1], center, p2, newPoints[2]);
  var q3 = new URBGEN.Poly(center, newPoints[3], newPoints[2], p3);
  newPolys.push(q0);
  newPolys.push(q1);
  newPolys.push(q2);
  newPolys.push(q3);
  return newPolys;
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
    y = p1.x * m1 + p1.y;
  } else if (m1 === Infinity) {
    x = p1.x;
    y = p0.x * m0 + p0.y;
  // Otherwise, find the intersection point
  } else {
    x = (p1.y - p0.y + (m0 * p0.x) - (m1 * p1.x)) / (m0 - m1);
    y = m1 * (x - p1.x) + p1.y;
  }
  point = new URBGEN.Point(x, y, 0);
  return point;
};
/**
 * Delegate to the relevant function. arg3 can be either a point or a direction.
 */
URBGEN.Util.insertPoint = function(newPoint, p0, arg3) {
  if (isNaN(arg3)) {
    return URBGEN.Util.insertPointUsingPoints(newPoint, p0, arg3);
  } else {
    return URBGEN.Util.insertPointUsingDir(newPoint, p0, arg3);
  }
}
/**
 * Sets the neighbor relations of p0 and p1 with the newPoint. If p0 and p1 are
 * not neighbors, returns false.
 */
URBGEN.Util.insertPointUsingPoints = function(newPoint, p0, p1) {
  var direction = p0.neighbors.indexOf(p1);
  if (2 > direction || direction > 3) {
    return false;
  }
  var p = p0;
  var q = p1;
  q.neighbors[direction - 2] = newPoint;
  p.neighbors[direction] = newPoint;
  newPoint.neighbors[direction] = q;
  newPoint.neighbors[direction - 2] = p;
  return true;
}
/**
 * Sets the neighbor relations of p0 and its neighbor in the specified direction
 * with the newPoint.
 */
URBGEN.Util.insertPointUsingDir = function(newPoint, p0, direction) {
  if (2 > direction || direction > 3) {
    return undefined;
  }
  var maxSteps = 100;
  for (var i = 0; i < maxSteps; i++) {
    var r = URBGEN.Util.getPointAsRatio(newPoint, p0, p0.neighbors[direction]);
    if (r < 1) {
      return URBGEN.Util.insertPointUsingPoints(newPoint, p0, p0.neighbors[direction])
    }
    p0 = p0.neighbors[direction];
  }
  return false;
}
/**
 * Returns a point on the specified edge that is within the specified distance
 * of the specified point. If includeEnds is true, then the start and end points
 * of the edge will be included in the search. If no such point exists, returns
 * the original point.
 */
URBGEN.Util.checkNearPoints = function(edge, point, distance, includeEnds) {
  // Find the point as a ratio of the line
  var pointR = URBGEN.Util.getPointAsRatio(point, edge.points[0],
    edge.points[edge.points.length - 1]);
  // Use the line length to get the distance as a ration
  var length = URBGEN.Util.getLength(edge.points[0],
    edge.points[edge.points.length - 1]);
  var distanceR = distance / length;
  // Get the range in which points must be found
  var minR = Math.max(0, pointR - distanceR);
  var maxR = Math.min(1, pointR + distanceR);
  // Check each point on the edge, returning the first that lies in range
  var start;
  var end;
  if (includeEnds) {
    start = 0;
    end = edge.points.length;
  } else {
    start = 1;
    end = edge.points.length - 1;
  }
  for (var i = start; i < end; i++) {
    var currPoint = edge.points[i];
    var r = URBGEN.Util.getPointAsRatio(currPoint, edge.points[0],
      edge.points[edge.points.length - 1]);
    if (minR <= r && r <= maxR) {
      return currPoint;
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
 * Returns true if the specified point lies on the line through p0 and p1
 */
URBGEN.Util.onLine = function(point, p0, p1) {
  var area = URBGEN.Util.areaTri(p0, point, p1);
  // If the area of tri formed by  3 points is 0, then they are colinear
  if (Math.abs(area) < 0.000001) {
    return true;
  }
  return false;
};
/**
 * Returns true if the specified point lies on the line segment p0p1
 */
URBGEN.Util.onLineSegment = function(point, p0, p1) {
  var r = URBGEN.Util.getPointAsRatio(point, p0, p1);
  if (isNaN(r)) {
    return false;
  }
  if (0 <= r && r <= 1) {
    return true;
  }
  return false;
};
/**
 * Finds the population center of the specified quad, depending on the location
 * of the global city center and the city's denisty.
 */
URBGEN.Util.getPopCenter = function(quad) {
  var nearestCorner = URBGEN.Util.nearest(quad.corners, globalCityCenter);
  var oppositeCorner;
  for (var i = 0; i < quad.corners.length; i++) {
    if (quad.corners[i] === nearestCorner) {
      continue;
    }
    if (nearestCorner.neighbors.indexOf(quad.corners[i]) === -1) {
      oppositeCorner = quad.corners[i];
      break;
    }
  }
  var center = URBGEN.Util.linearInterpolate(nearestCorner,
    oppositeCorner, globalCityDensity);
  return center;
};
/**
 * Tests the specified poly to ascertain whether or not it is a quad. A quad is
 * a poly whose four adjacent corners are neighbors, ie, there are no extra
 * points along any of the edges. Returns a results object which contains
 * isQuad (boolean) and 4 arrays, which contain the points composing a side if
 * that side is not a line segment.
 */
URBGEN.Util.testForQuad = function(poly) {
  var isQuad = true;
  // Create four edges
  var p0p1 = new URBGEN.Edge([poly.corners[0], poly.corners[1]], 3);
  var p0p2 = new URBGEN.Edge([poly.corners[0], poly.corners[2]], 2);
  var p1p3 = new URBGEN.Edge([poly.corners[1], poly.corners[3]], 2);
  var p2p3 = new URBGEN.Edge([poly.corners[2], poly.corners[3]], 3);
  // Check if all edges are line segments
  if (poly.corners[0].neighbors[3] !== poly.corners[1]) {
    isQuad = false;
    var path = URBGEN.Util.getDirectedPath(poly.corners[0], poly.corners[1], 3);
    p0p1 = path;
  }
  if (poly.corners[0].neighbors[2] !== poly.corners[2]) {
    isQuad = false;
    var path = URBGEN.Util.getDirectedPath(poly.corners[0], poly.corners[2], 2);
    p0p2 = path;
  }
  if (poly.corners[1].neighbors[1] !== poly.corners[0]) {
    isQuad = false;
  }
  if (poly.corners[1].neighbors[2] !== poly.corners[3]) {
    isQuad = false;
    var path = URBGEN.Util.getDirectedPath(poly.corners[1], poly.corners[3], 2);
    p1p3 = path;
  }
  if (poly.corners[2].neighbors[0] !== poly.corners[0]) {
    isQuad = false;
  }
  if (poly.corners[2].neighbors[3] !== poly.corners[3]) {
    isQuad = false;
    var path = URBGEN.Util.getDirectedPath(poly.corners[2], poly.corners[3], 3);
    p2p3 = path;
  }
  if (poly.corners[3].neighbors[0] !== poly.corners[1]) {
    isQuad = false;
  }
  if (poly.corners[3].neighbors[1] !== poly.corners[2]) {
    isQuad = false;
  }
  // Make the results object to return
  var result = {
    isQuad: isQuad,
    horizontal: new URBGEN.EdgePair(p0p1, p2p3),
    vertical: new URBGEN.EdgePair(p0p2, p1p3)
  }
  return result;
};

////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// USER CONTROLLED VARIABLES
////////////////////////////////////////////////////////////////////////////////
/**
 * CITY CENTER
 */
var globalCityCenter = new URBGEN.Point(800, 300, 0);
/**
 * CITY DENISTY - HIGHER NUMBER IS LOWER DENSITY
 */
var density = 0.3; // this is the number that will come from the slider
var globalCityDensity = 1 - density; // convert it for use
/**
 * ANGLE OF GRID'S X AXIS
 */
var globalCityGridX = 0.225;

////////////////////////////////////////////////////////////////////////////////