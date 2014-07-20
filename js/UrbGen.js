// Edges with length less than MIN_LENGTH are marked as atomic
var MIN_LENGTH = 10;
var GRID_X = 0.0;
/**
 * Defines a point, specified by x, y, and z coords
 */
var Point = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.setValues = function(point) {
    this.x = point.x;
    this.y = point.y;
    this.z = point.z;
  };
};
/**
 * Defines an edge
 */
var Edge = function(start, end, opposite) {
  this.start = start;
  this.end = end;
  this.opposite;
  this.endConnector;
  this.startConnector;
  this.isMaster; // true if this edge forms the top of a quadrilateral
  this.angle = function() {
    return getAngle(this);
  };
  this.getPoint = function(r) {
    return linearInterpolate(this, r);
  };
  this.length = function() {
    return getLength(this.start, this.end);
    //return Math.sqrt(Math.pow((this.end.x - this.start.x), 2)+ Math.pow((this.end.y - this.start.y), 2));
  };
  this.atomic = ((this.length() < MIN_LENGTH) ? true : false);
};
/**
 * Divides the specified edge into two edges, at the specified break point r.
 */
var splitEdge = function(edge, r) {
  var points = [];
  points.push(edge.start);
  points.push(edge.getPoint(r));
  points.push(edge.end);
  var newEdges = makeEdges(edge, points);
  return newEdges;
};
/**
 * Halves an edge
 */
var halve = function(edge, angle, r) {
  if (edge.opposite !== undefined) {
    if (edge.length() / 2 < MIN_LENGTH || edge.opposite.length() / 2 < MIN_LENGTH) {
      return;
    }
    //if (!edge.isMaster) return;
    var es = splitEdgeAndConnect(edge, angle, r);
    var args = [edges.indexOf(edge), 1].concat(es);
    Array.prototype.splice.apply(edges, args);
    edges.splice(edges.indexOf(edge.opposite), 1);
  }
};
/**
 * Divides an edge in two at the point r, creating a new connecting edge at angle
 */
var splitEdgeAndConnect = function(edge, angle, r) {
  var newEdge;
  var dR = 0;
  if (edge.opposite === undefined) {
    return;
  }
  if (r === undefined) {
    r = getLimitedRandom();
  }
  var top = splitEdge(edge, r);
  if (angle !== undefined) {
    var intersect = findIntersectPoint(top[0].end, angle,
      edge.opposite.start, edge.opposite.angle());
    if (pointOnEdge(edge.opposite, intersect)) {
      r = getPointAsRatio(edge.opposite, intersect);
    } else {
      dR = (Math.random() - 0.5) / 10;
    }
  } else {
    dR = (Math.random() - 0.5) / 10;
  }
  var bottom = splitEdge(edge.opposite, r + dR);
  newEdge = new Edge(top[0].end, bottom[0].end);
  var ret = [];
  setEdgeRelations(edge, top, edge.opposite, bottom, newEdge);
  for (var i = 0; i < top.length; i++) {
    ret.push(top[i]);
    ret.push(bottom[i]);
  }
  ret.push(newEdge);
  return ret;
};
/**
 * Sets edge's connecting edges
 */
var setEdgeRelations = function(edge, newEdges, opposite, newOpposites, newEdge) {
  if (edge.isMaster) {
    newEdges[0].startConnector = edge.startConnector;
    newEdges[0].endConnector = newEdge;
    newEdges[1].startConnector = newEdge;
    newEdges[1].endConnector = edge.endConnector;
    newOpposites[0].startConnector = opposite.startConnector;
    newOpposites[1].endConnector = opposite.endConnector;
    for (var i = 0; i < newEdges.length; i++) {
      newEdges[i].opposite = newOpposites[i];
    }
    if (newEdges[0].startConnector !== undefined) {
      newEdges[0].startConnector.startConnector = newEdges[0];
      newEdges[0].startConnector.endConnector = newOpposites[0];
      newEdges[0].startConnector.opposite = newEdge;
    }
    newEdge.startConnector = newEdges[1];
    newEdge.endConnector = newOpposites[1];
    newEdge.opposite = edge.endConnector;
    if (edge.endConnector !== undefined) {
      newEdge.opposite = edge.endConnector;
    }
  } else {
    newEdges[0].startConnector = edge.startConnector;
    newEdges[0].endConnector = newEdge;
    newEdges[1].startConnector = newEdge;
    newEdges[1].endConnector = edge.endConnector;
    newOpposites[0].startConnector = opposite.startConnector;
    newOpposites[1].endConnector = opposite.endConnector;
    for (var j = 0; j < newEdges.length; j++) {
      newEdges[j].opposite = newOpposites[j];
    }
    if (newEdges[0].startConnector !== undefined) {
      newEdges[0].startConnector.startConnector = newEdges[0];
      newEdges[0].startConnector.endConnector = newOpposites[0];
      newEdges[0].startConnector.opposite = newEdge;
    }
    newEdge.startConnector = newEdges[1];
    newEdge.endConnector = newOpposites[1];
    newEdge.opposite = edge.endConnector;
    if (edge.endConnector !== undefined) {
      newEdge.opposite = edge.endConnector;
    }
  }
};
/**
 * Divides the specified edge into the specified number of segments
 */
var divideEdge = function(edge, numSegments) {
  var points = [];
  for (var i = 0; i < numSegments - 1; i++) {
    points.push(Math.random());
  }
  points.sort();
  var concretePoints = [];
  concretePoints.push(edge.start);
  for (var j = 0; j < points.length; j++) {
    var p = edge.getPoint(points[j]);
    if (getLength(concretePoints[concretePoints.length - 1], p) > MIN_LENGTH) {
      concretePoints.push(p);
    }
  }
  if (getLength(concretePoints[concretePoints.length - 1], edge.end) < MIN_LENGTH) {
    concretePoints.pop();
  }
  concretePoints.push(edge.end);
  var e = makeEdges(edge, concretePoints);
  if (e === undefined) {
    return [edge];
  }
  e[0].startConnector = edge.startConnector;
  e[e.length - 1].endConnector = edge.endConnector;
  return e;
};
/**
 * Returns the length of a line segment between the two specified points
 */
var getLength = function(start, end) {
  //console.debug(start.x + ", " + end.x);
  var length = Math.sqrt(Math.pow((end.x - start.x), 2)
    + Math.pow((end.y - start.y), 2));
  return length;
};
/**
 * Returns the angle of an edge in radians
 */
var getAngle = function(edge) {
  var x1 = edge.start.x;
  var x2 = edge.end.x;
  var y1 = edge.start.y;
  var y2 = edge.end.y;
  if (y1 === y2) {
    if (x2 > x1) {return 0;} else {return Math.PI;}
  }
  var angle = Math.atan2((y2 - y1), (x2 - x1));
  //console.debug("the angle in degrees from + x axis = " + angle * (180/Math.PI));
  if (y2 > y1) {return angle; } else {return (2 * Math.PI) + angle;}
};
/**
 * Returns the angle of the grid axis that is closest to being perpendicular to
 * the specified edge.
 */
var getGridAngle = function(edge) {
  // Get the angle as a multiple of Pi adjusted to standard x y axes
  var a = edge.angle() / Math.PI - GRID_X;
  // Find which axis a line at this angle is closest to (0 or 4, 1, 2, 3)
  a = Math.round(a * 2);
  // If even, the line is closest to x axis, so return the y axis of the grid
  if (a % 2 === 0) {
    return Math.PI * (GRID_X + 0.5);
  } else {
    return Math.PI * GRID_X;
  }
};
/**
 * Adds the specified dA (dA * Pi) to the specified angle. The result is
 * normalized to a value between 0 and 2 * Pi radians;
 */
var addAngle = function(angle, dA) {
  var newAngle = (angle + dA * Math.PI) % (2 * Math.PI);
  return newAngle;
  
};
/**
 * Returns a value that represents the specified point's
 * location on the line colinear with the specified edge
 */
var getPointAsRatio = function(edge, point) {
  if (!pointOnLine(edge, point)) {
    return NaN;
  }
  var d1 = point.x - edge.start.x;
  var d2 = edge.end.x - edge.start.x;
  return d1 / d2;
};
/**
 * Returns the shortest of two edges. If they are the same length, returns the
 * first arg.
 */
 var getShortestEdge = function(edge1, edge2) {
   if (edge1.length() > edge2.length()) {
     return edge2;
   }
   return edge1;
 };
/**
 * Given two lines, defined by a point on the line and the angle of the line,
 * returns the point at which the two lines intersect. If the lines are colinear,
 * returns p1.
 */
var findIntersectPoint = function(p1, a1, p2, a2) {
  //console.debug(p1.x + ", " + a1 + ", " + p2.x + ", " + a2);
  var p = p1;
  var q = p2;
  var m1 = Math.tan(a1);
  var m2 = Math.tan(a2);
  var x;
  var y;
  var point;
  // Check if the lines are colinear
  if (m1 === m2) return p1;
  // Check if either line is colinear with the y axis
  if (m1 === Infinity) {
    x = p.x;
    y = q.x * m2 + q.y;
  } else if (m2 === Infinity) {
    x = q.x;
    y = p.x * m1 + p.y;
  // Otherwise, find the intersection point
  } else {
    x = (q.y - p.y + (m1 * p.x) - (m2 * q.x)) / (m1 - m2);
    y = m2 * (x - q.x) + q.y;
  }
  point = new Point(x, y, 0);
  return point;
};
/**
 * Returns true if the specified point lies on the line colinear with the
 * specified edge.
 */
var pointOnLine = function(edge, point) {
  var area = areaTri(edge.start, point, edge.end);
  if (Math.abs(area) < 0.000001) {
    return true;
  }
  return false;
};
/**
 * Given an edge and a point returns
 * true if the point lies on the edge, false otherwise.
 */
var pointOnEdge = function(edge, point) {
  var pt = getPointAsRatio(edge, point);
  if (isNaN(pt)) {
    return false;
  }
  if (0 <= pt && pt <= 1) {
    return true;
  }
  return false;
};
/**
 * Finds the area of a triangle specified by 3 points
 */
var areaTri = function(p1, p2, p3) {
  var ret = p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y);
  return ret;
};
/**
 * Makes a chain of connected edges, spanning the same length as the specified
 * edge. The first edge in the chain starts at edge.start, and the last edge
 * in the chain ends at edge.end. The points in between are specified by points.
 * Each of these points is the end of the previous edge and the start of the next.
 */
var makeEdges = function(edge, points) {
  if (points.length < 2) return undefined;
  if (points[0] !== edge.start) return undefined;
  if (points[points.length - 1] !== edge.end) return undefined;
  var ret = [];
  var start = points[0];
  for (var i = 1; i < points.length; i++) {
    end = points[i];
    var newEdge = new Edge(start, end);
    newEdge.opposite = edge.opposite;
    newEdge.isMaster = edge.isMaster;
    ret.push(newEdge);
    start = end;
  }
  ret[0].startConnector = edge.startConnector;
  ret[ret.length - 1].endConnector = edge.endConnector;
  return ret;
};
// Defines an absolute edge, specified by a start and end point
var AbsEdge = function(start, end) {
  this.start = start;
  this.end = end;
  this.getPoint = function(r) {
    return linearInterpolate(this, r);
    //return cosineInterpolate(this, r);
  };
  this.length = function() {
    return Math.sqrt(Math.pow((this.end.x - this.start.x), 2)
      + Math.pow((this.end.y - this.start.y), 2));
  };
  this.atomic = ((this.length() < MIN_LENGTH) ? true : false);
};
// Defines a relative edge, specified by a master edge, and start and end values
var RelEdge = function(master, value0_1Start, value0_1End) {
  this.startValue = value0_1Start;
  this.endValue = value0_1End;
  this.start = master.getPoint(value0_1Start);
  this.end = master.getPoint(value0_1End);
  this.master = master;
  this.getPoint = function(r) {
    return master.getPoint(this.startValue
      + r * (this.endValue - this.startValue));
  };
  this.length = function() {
    return Math.sqrt(Math.pow((this.end.x - this.start.x), 2)
      + Math.pow((this.end.y - this.start.y), 2));
  };
  this.atomic = ((this.length() < MIN_LENGTH) ? true : false);
};
// Deines a composite edge, specified by a list of other edges
var CompEdge = function(edges) {
  this.edges = edges;
  this.start = this.edges[0].start;
  this.end = this.edges[this.edges.length - 1].end;
  this.edgeSize = 1 / edges.length;
  this.getPoint = function(r) {
    var edge = Math.floor(r / this.edgeSize);
    if (edge === edges.length) {
      return edges[edges.length - 1].end;
    } else {
      var r2 = (r - this.edgeSize * edge) / this.edgeSize;
      return edges[edge].getPoint(r2);
    }
  };
};
// Defines a Quadrilateral, specified by four edges
var Quad = function(edge1, edge2, edge3, edge4) {
  this.edges = [edge1, edge2, edge3, edge4];
  if (edge1.atomic || edge2.atomic || edge3.atomic || edge4.atomic) {
    this.atomic = true;
  } else {
    this.atomic = false;
  }
  this.area = function() { // THIS IS APPROX, DOES NOT RETURN ACTUAL AREA
    return this.edges[0].length() * this.edges[1].length();
  };
  this.intersectionPoints = [];
  this.addIntersectionPoint = function(edge, r) {
    if (edge === 0 || edge === 1) {
      this.intersectionPoints.push({edge: edge, r: r});
    }
  };
};
// Divides a Quadrilateral in two, adding the two new quads to the original
var divideQuad = function(quad) {
  /*
  if (quad.intersectionPoints.length > 0) {
    var r = quad.intersectionPoints[0].r;
    if (quad.intersectionPoints[0].edge === 0) {
      quad.intersectionPoints.shift();
      return getNewVerticalQuads(quad, r);
    } else {
      quad.intersectionPoints.shift();
      return getNewHorizontalQuads(quad, r);
    }
  }
  */
  if (Math.random() > 0.5) {
    return getNewVerticalQuads(quad, getLimitedRandom());
  } else {
    return getNewHorizontalQuads(quad, getLimitedRandom());
  }
};
// Create two new vertical quads
var getNewVerticalQuads = function(quad, r) {
  var newQuads = [];
  var startPoint = r;
  var endPoint = getLimitedRandom();//r;
  var start = quad.edges[0].getPoint(startPoint);
  var end = quad.edges[2].getPoint(endPoint);
  var newEdge = new Edge(start, end);
  if (newEdge.length() < MIN_LENGTH) {
    newQuads.push(quad);
    return newQuads;
  }
  var quad1 = new Quad(new RelEdge(quad.edges[0], 0, startPoint),
                      quad.edges[1],
                      new RelEdge(quad.edges[2], 0, endPoint),
                      newEdge);
  var quad2 = new Quad(new RelEdge(quad.edges[0], startPoint, 1),
                      newEdge,
                      new RelEdge(quad.edges[2], endPoint, 1),
                      quad.edges[3]);
  for (var i = 0; i < quad.intersectionPoints.length; i++) {
    quad2.addIntersectionPoint(quad.intersectionPoints[i].edge,
      quad.intersectionPoints[i].r);
  }
  newQuads.push(quad1);
  newQuads.push(quad2);
  return newQuads;
};
// Create two new horizontal quads
var getNewHorizontalQuads = function(quad, r) {
  var startPoint = r;
  var endPoint = getLimitedRandom();//r;
  var start = quad.edges[1].getPoint(startPoint);
  var end = quad.edges[3].getPoint(endPoint);
  var newEdge = new Edge(start, end);
  var quad1 = new Quad(quad.edges[0],
                      new RelEdge(quad.edges[1], 0, startPoint),
                      newEdge,
                      new RelEdge(quad.edges[3], 0, endPoint));
  var quad2 = new Quad(newEdge,
                      new RelEdge(quad.edges[1], startPoint, 1),
                      quad.edges[2],
                      new RelEdge(quad.edges[3], endPoint, 1));
  for (var i = 0; i < quad.intersectionPoints.length; i++) {
    quad2.addIntersectionPoint(quad.intersectionPoints[i].edge,
      quad.intersectionPoints[i].r);
  }
  var newQuads = [];
  newQuads.push(quad1);
  newQuads.push(quad2);
  return newQuads;
};
// Returns a random number in the range 0.3 - 0.7
var getLimitedRandom = function() {
  return (Math.random() * 2 + 4) / 10;
};
// Divides an edge into a composite edge, composed of n edges
var makeCompositeEdge = function(edge, n) {
  var edges = [];
  var edgeSize = 1 / n;
  var start = edge.start;
  var end = edge.getPoint(edgeSize);
  edges.push(new AbsEdge(start, end));
  for (var i = 1; i < n; i ++) {
    start = edges[i - 1].end;
    end = edge.getPoint((i + 1) * edgeSize);
    edges.push(new AbsEdge(start, end));
  }
  return new CompEdge(edges);
};
// Finds a point on an edge using linear interpolation
var linearInterpolate = function(edge, r) {
  var x = (1 - r) * edge.start.x + r * edge.end.x;
  var y = (1 - r) * edge.start.y + r * edge.end.y;
  var z = (1 - r) * edge.start.z + r * edge.end.z;
  return new Point(x, y, z);
};
// Finds a point on an edge using cosine interpolation for y value
var cosineInterpolate = function(edge, r) {
  r2 = (-1 * Math.cos(Math.PI * r) / 2) + 0.5;
  var x = (1 - r) * edge.start.x + r * edge.end.x;
  var y = (1 - r2) * edge.start.y + r2 * edge.end.y;
  var z = (1 - r) * edge.start.z + r * edge.end.z;
  return new Point(x, y, z);
};
// Finds the length of an edge
var getEdgeLength = function(edge) {
  return Math.sqrt(Math.pow(edge.end.x - edge.start.x, 2)
    + Math.pow(edge.end.y - edge.start.y, 2));
};
////////////////////////////////////////////////////////////////////////////////
/* DEPRECATED
////////////////////////////////////////////////////////////////////////////////
// Initializes the vertices array
var vertices = [];
// Initializes the roads array
var roadSegs = [];
// Initializes the blocks array
var blocks = [];
// Sets up the initial road segments
var init = function(width, height) {
  vertices.push(new Vec3(5, 5, 0));
  vertices.push(new Vec3(500, 4, 0));
  vertices.push(new Vec3(980, 600, 0));
  vertices.push(new Vec3(20, 500, 0));
  roadSegs.push(new RoadSegment(0, 1, 1));
  roadSegs.push(new RoadSegment(1, 2, 1));
  roadSegs.push(new RoadSegment(2, 3, 1));
  roadSegs.push(new RoadSegment(3, 0, 1));
  blocks.push(new Block(roadSegs[0], roadSegs[1], roadSegs[2], roadSegs[3]));
};
// Divides a block in two by dividing the 0th and 2nd sides
var divide = function(block, startEdge) {
  // original block
  //var block = blocks[0];
  // add two new vertices on edges 0 and 2
  vertices.push(getPointOnLine(block.edges[startEdge]));
  vertices.push(getPointOnLine(block.edges[startEdge + 2]));
  // add new road segment between these new points
  roadSegs.push(new RoadSegment(vertices.length - 2, vertices.length - 1, 1));
  // add new road segment for the second half of original block's 0th edge
  roadSegs.push(new RoadSegment(vertices.length - 2, block.edges[0].end, 1));
  // add new road segment for the first half of original block's 2nd edge
  roadSegs.push(new RoadSegment(block.edges[2].start, vertices.length - 1, 1));
  // add new block using these 3 road segments + the 1st edge of original block
  blocks.push(new Block(roadSegs[roadSegs.length - 2], block.edges[1],
    roadSegs[roadSegs.length - 1], roadSegs[roadSegs.length - 3]));
  // change end of original block's 0th edge to the start of new road segment
  block.edges[0].end = vertices.length - 2;
  // change original block's 1st edge to the new road segment
  block.edges[1] = roadSegs[roadSegs.length - 3];
  // change start of the block's 2nd edge to the end of the new road segment
  block.edges[2].start = vertices.length - 1;
};
// Finds the length of a Road Segment
var getLength = function(roadSegment) {
  return Math.sqrt(Math.pow(vertices[roadSegment.end].x
    - vertices[roadSegment.start].x, 2)
    + Math.pow(vertices[roadSegment.end].y
    - vertices[roadSegment.start].y, 2));
};
// Finds a random point on a line
var getPointOnLine = function(roadSegment, r) {
	var xLength = vertices[roadSegment.end].x - vertices[roadSegment.start].x;
	var yLength = vertices[roadSegment.end].y - vertices[roadSegment.start].y;
	if (isNaN(r)) {
	  r = (Math.random() * 2 + 4) / 10;
	}
	var point = new Vec3(Math.floor(vertices[roadSegment.start].x + xLength * r),
	  Math.floor(vertices[roadSegment.start].y + yLength * r), 0);
	console.debug("(" + p0.x + ", " + p0.y + ") and
	(" + p1.x + ", " + p1.y + ") : " + "(" + point.x + ", " + point.y + ")");
	return point;
};
// Defines a relative point, specified by a line and a value 0 - 1
var RelPoint = function(edge, r) {
  var point = edge.getPoint(r);
  this.x = point.x;
  this.y = point.y;
  this.z = point.z;
};
*/
