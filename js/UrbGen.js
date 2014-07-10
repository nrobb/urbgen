// Defines an abolute point, specified by a vec3
var AbsPoint = function(vec) {
  this.vec = vec;
  this.x = vec.x;
  this.y = vec.y;
  this.z = vec.z;
};
// Defines a relative point, specified by a line and a value 0 - 1
var RelPoint = function(edge, r) {
  this.vec = edge.getPoint(r).vec;
  this.x = vec.x;
  this.y = vec.y;
  this.z = vec.z;
};
// Defines a Vector
var Vec3 = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
};
// Defines an absolute edge, specified by a start and end vec3
var AbsEdge = function(vec3Start, vec3End) {
  this.start = new AbsPoint(vec3Start);
  this.end = new AbsPoint(vec3End);
  this.getPoint = function(r) {
    //return linearInterpolate(this, r);
    return cosineInterpolate(this, r);
  };
};
// Defines a relative edge, specified by a master edge, and start and end values
var RelEdge = function(master, value0_1Start, value0_1End) {
  this.start = master.getPoint(value0_1Start);
  this.end = master.getPoint(value0_1End);
  this.master = master;
  this.getPoint = function(r) {
    return master.getPoint(this.start + r * (this.end - this.start));
  };
};
// Defines a Quadrilateral, specified by four edges
var Quad = function(edge1, edge2, edge3, edge4) {
  this.edges = [edge1, edge2, edge3, edge4];
};
// Finds a point on an edge using linear interpolation
var linearInterpolate = function(edge, r) {
  var x = (1 - r) * edge.start.x + r * edge.end.x;
  var y = (1 - r) * edge.start.y + r * edge.end.y;
  var z = (1 - r) * edge.start.z + r * edge.end.z;
  return new AbsPoint(new Vec3(x, y, z));
};
// Finds a point on an edge using cosine interpolation for y value
var cosineInterpolate = function(edge, r) {
  r2 = (-1 * Math.cos(Math.PI * r) / 2) + 0.5;
  var x = (1 - r) * edge.start.x + r * edge.end.x;
  var y = (1 - r2) * edge.start.y + r2 * edge.end.y;
  var z = (1 - r) * edge.start.z + r * edge.end.z;
  return new AbsPoint(new Vec3(x, y, z));
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
*/