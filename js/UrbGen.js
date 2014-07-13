// Defines a point, specified by x, y, and z coords
var Point = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
};
// Defines an absolute edge, specified by a start and end point
var AbsEdge = function(start, end) {
  this.edges = [];
  this.start = start;
  this.end = end;
  this.getPoint = function(r) {
    return linearInterpolate(this, r);
    //return cosineInterpolate(this, r);
  };
  this.length = function() {
    return Math.sqrt(Math.pow((this.end.x - this.start.x), 2) + Math.pow((this.end.y - this.start.y), 2));
  };
};
// Defines a relative edge, specified by a master edge, and start and end values
var RelEdge = function(master, value0_1Start, value0_1End) {
  this.startValue = value0_1Start;
  this.endValue = value0_1End;
  this.start = master.getPoint(value0_1Start);
  this.end = master.getPoint(value0_1End);
  this.master = master;
  this.getPoint = function(r) {
    return master.getPoint(this.startValue + r * (this.endValue - this.startValue));
  };
  this.length = function() {
    return Math.sqrt(Math.pow((this.end.x - this.start.x), 2) + Math.pow((this.end.y - this.start.y), 2));
  };
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
  this.quads = [];
  this.area = function() { // THIS IS APPROX, DOES NOT RETURN ACTUAL AREA
    return this.edges[0].length() * this.edges[1].length();
  };
};
// Divides a Quadrilateral in two, adding the two new quads to the original
var divideQuad = function(quad) {
  if (Math.random() > 0.5) {
    return getNewVerticalQuads(quad);
  } else {
    return getNewHorizontalQuads(quad);
  }
};
// Create two new vertical quads
var getNewVerticalQuads = function(quad) {
  var startPoint = getLimitedRandom();
  var endPoint = getLimitedRandom();
  var start = quad.edges[0].getPoint(startPoint);
  var end = quad.edges[3].getPoint(endPoint);
  var newEdge = new AbsEdge(start, end);
  var quad1 = new Quad(new RelEdge(quad.edges[0], 0, startPoint),
                      newEdge,
                      quad.edges[2],
                      new RelEdge(quad.edges[3], 0, endPoint));
  var quad2 = new Quad(new RelEdge(quad.edges[0], startPoint, 1),
                      quad.edges[1],
                      newEdge,
                      new RelEdge(quad.edges[3], endPoint, 1));
  //quad.quads.push(quad1);
  //quad.quads.push(quad2);
  var newQuads = [];
  newQuads.push(quad1);
  newQuads.push(quad2);
  newQuads.forEach(drawQuad);
  return newQuads;
};
// Create two new horizontal quads
var getNewHorizontalQuads = function(quad) {
  var startPoint = getLimitedRandom();
  var endPoint = getLimitedRandom();
  var start = quad.edges[2].getPoint(startPoint);
  var end = quad.edges[1].getPoint(endPoint);
  var newEdge = new AbsEdge(start, end);
  var quad1 = new Quad(quad.edges[0],
                      new RelEdge(quad.edges[1], 0, endPoint),
                      new RelEdge(quad.edges[2], 0, startPoint),
                      newEdge);
  var quad2 = new Quad(newEdge,
                      new RelEdge(quad.edges[1], endPoint, 1),
                      new RelEdge(quad.edges[2], startPoint, 1),
                      quad.edges[3]);
  //quad.quads.push(quad1);
  //quad.quads.push(quad2);
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
