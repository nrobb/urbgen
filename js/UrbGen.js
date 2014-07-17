// Edges with length less than MIN_LENGTH are marked as atomic
var MIN_LENGTH = 35;
/**
 * Defines a point, specified by x, y, and z coords
 */
var Point = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
};
/**
 * Defines an edge
 */
var Edge = function(start, end, opposite) {
  this.start = start;
  this.end = end;
  this.opposite = opposite;
  this.successors = [3];
  this.angle = getAngle(this);
  //console.debug("edge has angle (in radians): " + this.angle / Math.PI + " Pi");
  this.getPoint = function(r) {
    return linearInterpolate(this, r);
  };
  this.length = function() {
    return Math.sqrt(Math.pow((this.end.x - this.start.x), 2)
      + Math.pow((this.end.y - this.start.y), 2));
  };
  this.atomic = ((this.length() < MIN_LENGTH) ? true : false);
};
/**
 * Divides the specified edge into two edges, at the specified break point r.
 */
var divideEdge = function(edge, r) {
  var points = [];
  points.push(edge.start);
  points.push(edge.getPoint(r));
  points.push(edge.end);
  var newEdges = makeEdges(edge, points);
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
    if (x2 > x1) {return 0.5 * Math.PI;} else {return 1.5 * Math.PI;}
  }
  var angle = Math.atan2((y2 - y1), (x2 - x1));
  console.debug("the angle in degrees from + x axis = " + angle * (180/Math.PI));
  if (y2 > y1) {return angle} else {return (2 * Math.PI) + angle;}
};
/**
 * Returns the point at which two lines intersect. The two lines are colinear
 * with the two specified edges;
 */
var findIntersectPoint = function(edge1, edge2) {
  var p = edge1.start;
  var q = edge2.start;
  var m1 = Math.tan(edge1.angle);
  var m2 = Math.tan(edge2.angle);
  if (m1 === m2) return undefined;
  var x = (q.y - p.y + (m1 * p.x) - (m2 * q.x)) / (m1 - m2);
  var y = m2 * (x - p.x) + q.y;
  console.debug(x + ", " + y);
  var point = new Point(x, y, 0);
  if (pointOnEdge(edge1, point)) {
    return point;
  }
  return undefined;
};
/**
 * Given an edge and a point returns
 * true if the point lies on the edge, false otherwise.
 */
var pointOnEdge = function(edge, point) {
  var x1 = edge.start.x;
  var y1 = edge.start.y;
  var x2 = edge.end.x;
  var y2 = edge.end.y;
  var x3 = point.x;
  var y3 = point.y;
  var matrix = [
    x1, y1, 1,
    x2, y2, 1,
    x3, y3, 1,
    ];
  if (det33(matrix) === 0) {
    return true;
  }
  return false;
};
/**
 * Finds the determinant of the specified 3 X 3 matrix
 */
var det33 = function(mat) {
  var det = (mat[0] * (mat[4] * mat[8] - mat[5] * mat[7]))
    - (mat[1] * (mat[3] * mat[8] - mat[5] * mat[6]))
    + (mat[2] * (mat[3] * mat[7] - mat[3] * mat[6]));
  det = Math.abs(Math.round(det));
  //console.debug(det);
  return det;
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
  if (edge.opposite === undefined) return undefined;
  var ret = [];
  var start = points[0];
  for (var i = 1; i < points.length; i++) {
    end = points[i];
    ret.push(new Edge(start, end, edge.opposite));
    start = end;
  }
  for (var j = 0; j < ret.length - 1; j++) {
    ret[j].successors[1] = ret[j + 1];
  }
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
  if (Math.random() > 0.5) {
    return getNewVerticalQuads(quad, getLimitedRandom());
  } else {
    return getNewHorizontalQuads(quad, getLimitedRandom());
  }
};
// Create two new vertical quads
var getNewVerticalQuads = function(quad, r) {
  var startPoint = r;
  var endPoint = getLimitedRandom();//r;
  var start = quad.edges[0].getPoint(startPoint);
  var end = quad.edges[2].getPoint(endPoint);
  var newEdge = new AbsEdge(start, end);
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
  var newQuads = [];
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
  var newEdge = new AbsEdge(start, end);
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
var getLength = function(edge) {
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
