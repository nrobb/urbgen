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
  this.edgeLengths = [
    URBGEN.Util.getLineSegmentLength(this.corners[0], this.corners[1]),
    URBGEN.Util.getLineSegmentLength(this.corners[1], this.corners[3]),
    URBGEN.Util.getLineSegmentLength(this.corners[0], this.corners[2]),
    URBGEN.Util.getLineSegmentLength(this.corners[2], this.corners[3])
  ];
  this.minEdgeLength;
  this.throughRoadStagger;
  this.denisty;
  this.atomic = false;
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
 * Defines an edge NOT TESTED MAY NOT USE
 */
URBGEN.Edge = function(points, direction) {
  this.points = points;
  this.direction = direction;
  this.angle = URBGEN.Util.getAngle(this.points[0],
    this.points[this.points.length - 1]);
};
/**
 * Constructs a city generator.
 */
URBGEN.Generator = function() {
  this.horizontalBuilder = new URBGEN.Builder.HorizontalBuilder();
  this.verticalBuilder = new URBGEN.Builder.VerticalBuilder();
  this.builder;
  this.director = new URBGEN.Builder.Director();
  this.cityPolys = [];
};
/**
 * Generates a city.
 */
URBGEN.Generator.prototype.generate = function() {
  
};
/**
 * Processes a polygon.
 */
URBGEN.Generator.prototype.processPoly = function(poly) {
  this.prepare(poly);
  var newPolys = this.director.execute(this.builder);
  return newPolys;
};
/**
 *
 */
URBGEN.Generator.prototype.prepare = function(poly) {
  /*TODO
    send the polygon to some other method which analyses it. needs to then
    prepare the polygon (ie set the density and stuff), set the right builder,
    set the builder's poly to the current poly, and set the builder's targets []
    (setting targets to empty array forces builder to use grid angle)
  */
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
URBGEN.Builder = function() {
  this.poly;
  this.origin;
  this.endPoints;
  this.newPoints;
  this.targets;
};
/**
 * Returns an array of new polys created from this builder's current points.
 */
URBGEN.Builder.prototype.buildPolys = function(newPoints) {
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
URBGEN.Builder.GridBuilder.prototype.getNewPoints = function(data) {
  
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
 * Sets the origin point for the new dividing line
 */
URBGEN.Builder.HorizontalBuilder.prototype.setOrigin = function() {
  var origin;
  var edgeStart;
  var edgeEnd;
  var edgeReversed = false;
  // Set the start and end points, and a flag if the edge is being used reveresed
  if (URBGEN.Util.nearest([this.poly.corners[0], this.poly.corners[2]],
    URBGEN.Variables.globalCityCenter) === this.poly.corners[2]) {
      edgeStart = this.poly.corners[2];
      edgeEnd = this.poly.corners[0];
      edgeReversed = true;
  } else {
    edgeStart = this.poly.corners[0];
    edgeEnd = this.poly.corners[2];
  }
  // Get the origin point using either density or minEdgeLength
  if (this.poly.density === undefined) {
    origin = URBGEN.Util.linearInterpolateByLength(edgeStart, edgeEnd,
      this.poly.minEdgeLength);
  } else {
    origin = URBGEN.Util.linearInterpolate(edgeStart, edgeEnd,
      this.poly.density);
    // If the origin point is too close to the edge's start, move it
    if (Math.abs(URBGEN.Util.getLineSegmentLength(edgeStart, origin))
      < this.poly.minEdgeLength) {
        origin = URBGEN.Util.linearInterpolateByLength(edgeStart, edgeEnd,
          this.poly.minEdgeLength);
      }
  }
  // Get any points that lie on the edge
  var direction = edgeReversed ? 0 : 2;
  var path = URBGEN.Util.getDirectedPath(edgeStart, edgeEnd, direction);
  // Check if any of these points are close enough to use
  var distance = this.poly.throughRoadStagger;
  var nearPoint = URBGEN.Util.checkNearPoints(origin, path, distance, false);
  // Set this builder's origin point, inserting it to the edge if needed
  if (origin !== nearPoint) {
    this.origin = nearPoint;
  } else {
    var neighbors = URBGEN.Util.getNeighbors(origin, path);
    URBGEN.Util.insertPoint(origin, neighbors.prev, neighbors.nxt);
    this.origin = origin;
  }
};
/**
 * Sets the end point for the new dividing line
 */
URBGEN.Builder.HorizontalBuilder.prototype.setEndPoints = function() {
  var edgeStart = this.poly.corners[1];
  var edgeEnd = this.poly.corners[3];
  // Find the angles of the new line and the intersecting edge
  var angle;
  if (this.targets.length === 0) {
    angle = URBGEN.Util.getGridAngle(edgeStart, edgeEnd);
  } else {
    var midPoint = URBGEN.Util.linearInterpolate(edgeStart, edgeEnd, 0.5);
    var target = URBGEN.Util.nearest(this.targets, midPoint);
    angle = URBGEN.Util.getAngle(this.origin, target);
  }
  var intersectAngle = URBGEN.Util.getAngle(edgeStart, edgeEnd);
  // Get the end point
  var endPoint = URBGEN.Util.getIntersect(this.origin, angle, edgeStart,
    intersectAngle);
  // Get the min r value
  var minPoint = URBGEN.Util.linearInterpolateByLength(edgeStart,
    edgeEnd, this.poly.minEdgeLength);
  var minR = URBGEN.Util.getPointAsRatio(minPoint, edgeStart, edgeEnd);
  // Get the end point's r value
  var endPointR = URBGEN.Util.getPointAsRatio(endPoint, edgeStart, edgeEnd);
  // If needed, move end point to lie on the allowed part of the line segment
  if (endPointR < minR) {
    endPointR = minR;
  } else if (endPointR > 1 - minR) {
    endPointR = 1 - minR;
  }
  endPoint = URBGEN.Util.linearInterpolate(edgeStart, edgeEnd, endPointR);
  // Get any points that lie on the edge
  var path = URBGEN.Util.getDirectedPath(edgeStart, edgeEnd, 2);
  // Check if any of these points are close enough to use
  var distance = this.poly.throughRoadStagger;
  var nearPoint = URBGEN.Util.checkNearPoints(endPoint, path, distance, false);
  // Set this builder's end point, inserting it to the edge if needed
  if (endPoint !== nearPoint) {
    this.endPoints = [nearPoint];
  } else {
    var neighbors = URBGEN.Util.getNeighbors(endPoint, path);
    URBGEN.Util.insertPoint(endPoint, neighbors.prev, neighbors.nxt);
    this.endPoints = [endPoint];
  }
};
/**
 * Sets this builder's current new points
 */
URBGEN.Builder.HorizontalBuilder.prototype.setNewPoints = function(data) {
  this.origin.neighbors[3] = this.endPoints[0];
  this.endPoints[0].neighbors[1] = this.origin;
  this.newPoints = [
    [this.poly.corners[0], this.poly.corners[1], this.origin, this.endPoints[0]],
    [this.origin, this.endPoints[0], this.poly.corners[2], this.poly.corners[3]]
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
 * Sets the origin point for the new dividing line
 */
URBGEN.Builder.VerticalBuilder.prototype.setOrigin = function() {
  var edgeStart;
  var edgeEnd;
  var edgeReversed = false;
  // Set the start and end points, and a flag if the edge is being used reveresed
  if (URBGEN.Util.nearest([this.poly.corners[0], this.poly.corners[1]],
    URBGEN.Variables.globalCityCenter) === this.poly.corners[1]) {
      edgeStart = this.poly.corners[1];
      edgeEnd = this.poly.corners[0];
      edgeReversed = true;
  } else {
    edgeStart = this.poly.corners[0];
    edgeEnd = this.poly.corners[1];
  }
  // Get the origin point using either density or minEdgeLength
  if (this.poly.density === undefined) {
    origin = URBGEN.Util.linearInterpolateByLength(edgeStart, edgeEnd,
      this.poly.minEdgeLength);
  } else {
    origin = URBGEN.Util.linearInterpolate(edgeStart, edgeEnd,
      this.poly.density);
    // If the origin point is too close to the edge's start, move it
    if (Math.abs(URBGEN.Util.getLineSegmentLength(edgeStart, origin))
      < this.poly.minEdgeLength) {
        origin = URBGEN.Util.linearInterpolateByLength(edgeStart, edgeEnd,
          this.poly.minEdgeLength);
      }
  }
  // Get any points that lie on the edge
  var direction = edgeReversed ? 1 : 3;
  var path = URBGEN.Util.getDirectedPath(edgeStart, edgeEnd, direction);
  // Check if any of these points are close enough to use
  var distance = this.poly.throughRoadStagger;
  var nearPoint = URBGEN.Util.checkNearPoints(origin, path, distance, false);
  // Set this builder's origin point, inserting it to the edge if needed
  if (origin !== nearPoint) {
    this.origin = nearPoint;
  } else {
    var neighbors = URBGEN.Util.getNeighbors(origin, path);
    URBGEN.Util.insertPoint(origin, neighbors.prev, neighbors.nxt);
    this.origin = origin;
  }
};
/**
 * Sets the end point for the new dividing line
 */
URBGEN.Builder.VerticalBuilder.prototype.setEndPoints = function() {
  var edgeStart = this.poly.corners[2];
  var edgeEnd = this.poly.corners[3];
  // Find the angles of the new line and the intersecting edge
  var angle;
  if (this.targets.length === 0) {
    angle = URBGEN.Util.getGridAngle(edgeStart, edgeEnd);
  } else {
    var midPoint = URBGEN.Util.linearInterpolate(edgeStart, edgeEnd, 0.5);
    var target = URBGEN.Util.nearest(this.targets, midPoint);
    angle = URBGEN.Util.getAngle(this.origin, target);
  }
  var intersectAngle = URBGEN.Util.getAngle(edgeStart, edgeEnd);
  // Get the end point
  var endPoint = URBGEN.Util.getIntersect(this.origin, angle, edgeStart,
    intersectAngle);
  // Get the min r value
  var minPoint = URBGEN.Util.linearInterpolateByLength(edgeStart,
    edgeEnd, this.poly.minEdgeLength);
  var minR = URBGEN.Util.getPointAsRatio(minPoint, edgeStart, edgeEnd);
  // Get the end point's r value
  var endPointR = URBGEN.Util.getPointAsRatio(endPoint, edgeStart, edgeEnd);
  // If needed, move end point to lie on the allowed part of the line segment
  if (endPointR < minR) {
    endPointR = minR;
  } else if (endPointR > 1 - minR) {
    endPointR = 1 - minR;
  }
  endPoint = URBGEN.Util.linearInterpolate(edgeStart, edgeEnd, endPointR);
  // Get any points that lie on the edge
  var path = URBGEN.Util.getDirectedPath(edgeStart, edgeEnd, 3);
  // Check if any of these points are close enough to use
  var distance = this.poly.throughRoadStagger;
  var nearPoint = URBGEN.Util.checkNearPoints(endPoint, path, distance, false);
  // Set this builder's end point, inserting it to the edge if needed
  if (endPoint !== nearPoint) {
    this.endPoints = [nearPoint];
  } else {
    var neighbors = URBGEN.Util.getNeighbors(endPoint, path);
    URBGEN.Util.insertPoint(endPoint, neighbors.prev, neighbors.nxt);
    this.endPoints = [endPoint];
  }
};
/**
 * Sets this builder's current new points
 */
URBGEN.Builder.VerticalBuilder.prototype.setNewPoints = function(data) {
  this.origin.neighbors[2] = this.endPoints[0];
  this.endPoints[0].neighbors[0] = this.origin;
  this.newPoints = [
    [this.poly.corners[0], this.origin, this.poly.corners[2], this.endPoints[0]],
    [this.origin, this.poly.corners[1], this.endPoints[0], this.poly.corners[3]]
  ];
};
/**
 * Constructs a director
 */
URBGEN.Builder.Director = function() {
  
};
/**
 * Invokes the builder
 */
URBGEN.Builder.Director.prototype.execute = function(builder, targets) {
  builder.targets = (targets === undefined) ? [] : targets;
  builder.setOrigin();
  builder.setEndPoints();
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
URBGEN.Util.getGridAngle = function(p0, p1) {
  // Get the angle as a multiple of Pi adjusted to standard x y axes
  var angle = URBGEN.Util.getAngle(p0, p1) / Math.PI - URBGEN.Variables.globalCityGridX;
  // Find which axis a line at this angle is closest to (0 or 4, 1, 2, 3)
  var axis = Math.round(angle * 2);
  // If even, the line is closest to x axis, so return the y axis of the grid
  if (axis % 2 === 0) {
    return Math.PI * (URBGEN.Variables.globalCityGridX + 0.5);
  } else {
    return Math.PI * URBGEN.Variables.globalCityGridX;
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
 * Returns the direction (0 - 3) in which you must travel from p0 to reach p1.
 * If p1 is not found in maxSteps (defaults to 100) iterations, returns false.
 * NOT TESTED AND NOT CURRENTLY USED
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
 * Finds the population center of the specified poly, depending on the location
 * of the global city center and the city's denisty.
 */
URBGEN.Util.getPopCenter = function(poly) {
  var nearestCorner = URBGEN.Util.nearest(poly.corners, URBGEN.Variables.globalCityCenter);
  var oppositeCorner;
  for (var i = 0; i < poly.corners.length; i++) {
    if (poly.corners[i] === nearestCorner) {
      continue;
    }
    if (nearestCorner.neighbors.indexOf(poly.corners[i]) === -1) {
      oppositeCorner = poly.corners[i];
      break;
    }
  }
  var center = URBGEN.Util.linearInterpolate(nearestCorner,
    oppositeCorner, URBGEN.Variables.globalCityDensity);
  return center;
};

////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
// USER CONTROLLED VARIABLES
////////////////////////////////////////////////////////////////////////////////
URBGEN.Variables = {};
/**
 * CITY CENTER
 */
URBGEN.Variables.globalCityCenter = new URBGEN.Point(Math.random() * 100, Math.random() * 100, 0);
/**
 * CITY DENISTY - HIGHER NUMBER IS LOWER DENSITY
 */
var density = 0.5; // (0.2 - 0.5 ( inclusive)
URBGEN.Variables.globalCityDensity = 1 - density; // convert it for use
/**
 * ANGLE OF GRID'S X AXIS
 */
URBGEN.Variables.globalCityGridX = 0.25; //(0 - 0.5 (exclusive)
////////////////////////////////////////////////////////////////////////////////