//URBGEN

/**
 * Declares a global namespace
 */
var URBGEN = URBGEN || {};
/**
 * Represents a point. If no x, y and z are specified, the point will have
 * coordinates (0, 0, 0).
 * @constructor
 * @param {number} x - The x coordinate of the point.
 * @param {number} y - The y coordinate of the point.
 * @param {number} y - The y coordinate of the point.
 */
URBGEN.Point = function(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.neighbors = [ 0, 0, 0, 0 ];
};
/**
 * Sets this points x, y and z coordinates to those of the specified Point.
 * @param {URBGEN.Point} point - The Point providing the values to set.
 */
URBGEN.Point.prototype.setValues = function(point) {
	this.x = point.x;
	this.y = point.y;
	this.z = point.z;
};
/**
 * Defines a polygon.
 * @constructor
 * @param {URBGEN.Point} p0 - the top left corner of the polygon.
 * @param {URBGEN.Point} p1 - the top right corner of the polygon.
 * @param {URBGEN.Point} p2 - the bottom left corner of the polygon.
 * @param {URBGEN.Point} p3 - the bottom right corner of the polygon.
 */
URBGEN.Poly = function(p0, p1, p2, p3) {
	this.corners = [ p0, p1, p2, p3 ];
	this.edgeLengths = [
	                    URBGEN.Util.getLineSegmentLength(this.corners[0], this.corners[1]),
	                    URBGEN.Util.getLineSegmentLength(this.corners[1], this.corners[3]),
	                    URBGEN.Util.getLineSegmentLength(this.corners[0], this.corners[2]),
	                    URBGEN.Util.getLineSegmentLength(this.corners[2], this.corners[3]) ];
	this.gridAngle;
};
/**
 * Sets this polygon's grid angle.
 * @param {number} random - A random number between 0 - 1 (inclusive).
 */
URBGEN.Poly.prototype.setGridAngle = function(random) {
	var start = URBGEN.Util.linearInterpolate(this.corners[0], this.corners[2],
			0.5);
	var end = URBGEN.Util.linearInterpolate(this.corners[1], this.corners[3],
			random * 0.5 + 0.2);
	this.gridAngle = URBGEN.Util.getAngle(start, end);
};
/**
 * Sets this polygon's corners as neighbors so that there are no
 * extra points included on any edge.
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
 * Represents a plot.
 * @constructor
 * @param {URBGEN.Poly} poly - This plot's polygon.
 */
URBGEN.Plot = function(poly) {
	this.poly = poly;
	this.height;
};
/**
 * Represents a block.
 * @constructor
 * @param {URBGEN.Poly} outerPoly - This block's outer polygon, including any
 *     space for roads and sidewalks.
 * @param {number} streetWidth - The width of the streets surrounding this block.
 */
URBGEN.Block = function(poly, streetWidth) {
	this.streetWidth = streetWidth;
	this.outerPoly = poly;
	this.innerPoly;
	this.plots = [];
	this.setInnerPoly(streetWidth);
};
/**
 * Sets this block's inner polygon. This is the polygon that this block's plots
 * lie within, excluding any space for streets and sidewalks.
 */
URBGEN.Block.prototype.setInnerPoly = function() {
	this.innerPoly = URBGEN.Util
	.insetPoly(this.outerPoly, this.streetWidth / 2);
	this.innerPoly.makeSimple();
};
/**
 * Represents a city.
 * @constructor
 */
URBGEN.City = function() {
	this.poly;
	this.roads = [];
	this.blocks = [];
	this.area;
	this.geometry = {
			vertices : [],
			faces : []
	};
};
/**
 * Returns an array of the plots of this city.
 * @return {Array.<URBGEN.Plot>} The plots of this city.
 */
URBGEN.City.prototype.getPlots = function() {
	var plots = [];
	for ( var i = 0; i < this.blocks.length; i++) {
		plots = plots.concat(this.blocks[i].plots);
	}
	return plots;
};
/**
 * Represents a generator.
 * @constructor
 */
URBGEN.Generator = function() {
	// Set up the builders and director
	this.horizontalBuilder = new URBGEN.Builder.HorizontalBuilder(this);
	this.verticalBuilder = new URBGEN.Builder.VerticalBuilder(this);
	this.plotBuilder = new URBGEN.Builder.PlotBuilder(this);
	this.builder;
	this.director = new URBGEN.Builder.Director();
	// declare the city
	this.city;
	// Set up random number generator
	this.random = new URBGEN.Math.Random();
	// Decalare the polys for building the city
	this.cityPolys;
	// City generator parameters
	this.globalAngle;
	this.randomSeed;
	this.regularity1;
	this.regularity2;
	this.localGrids;
	this.blockSize;
	this.cityWidth;
	this.cityDepth;
	this.streetWidth;
	this.throughRoads;
};
/**
 * Sets this generator's parameters. If any paramaters in the cityParmas object
 * are undefined, sets those parameters to random values.
 * @param {Object} cityParams - The paramters this generator should use to
 *     generate a city.
 */
URBGEN.Generator.prototype.setParams = function(cityParams) {
  if (cityParams === undefined) {
    cityParams = {};
  }
	this.localGrids = cityParams.localGrids || Math.random();
	this.randomSeed = cityParams.randomSeed || Math.random();
	this.globalAngle = cityParams.globalAngle || Math.random();
	this.blockSize = cityParams.blockSize || Math.random()
	* (URBGEN.Constants.MAX_BLOCK_SIZE - URBGEN.Constants.MIN_BLOCK_SIZE)
	+ URBGEN.Constants.MIN_BLOCK_SIZE;
	this.cityWidth = cityParams.cityWidth || Math.random()
	* (URBGEN.Constants.MAX_CITY_WIDTH - URBGEN.Constants.MIN_CITY_WIDTH)
	+ URBGEN.Constants.MIN_CITY_WIDTH;
	this.cityDepth = cityParams.cityDepth || Math.random()
	* (URBGEN.Constants.MAX_CITY_DEPTH - URBGEN.Constants.MIN_CITY_DEPTH)
	+ URBGEN.Constants.MIN_CITY_DEPTH;
	this.throughRoads = cityParams.throughRoads || Math.random()
	* URBGEN.Constants.MAX_THROUGH_ROADS;
	this.streetWidth = cityParams.streetWidth || Math.random()
	* (URBGEN.Constants.MAX_STREET_WIDTH - URBGEN.Constants.MIN_STREET_WIDTH)
	+ URBGEN.Constants.MIN_STREET_WIDTH;
};
/**
 * Returns this generator's current city parameters.
 * @return {Object} The parameters.
 */
URBGEN.Generator.prototype.getParams = function() {
  var cityParams = {
    localGrids: this.localGrids,
    randomSeed: this.randomSeed,
    globalAngle: this.globalAngle,
    blockSize: this.blockSize,
    cityWidth: this.cityWidth,
    cityDepth: this.cityDepth,
    throughRoads: this.throughRoads,
    streetWidth: this.streetWidth
  };
  return cityParams;
};
/**
 * Initializes this generator.
 * @throws {URBGEN.Exception.InvalidParamException}
 */
URBGEN.Generator.prototype.init = function() {
	if (isNaN(this.localGrids) || isNaN(this.randomSeed)
			|| isNaN(this.globalAngle) || isNaN(this.blockSize)
			|| isNaN(this.cityWidth) || isNaN(this.cityDepth)
			|| isNaN(this.throughRoads) || isNaN(this.streetWidth)) {
		throw new URBGEN.Exception.InvalidParamException();
	}
	// Initialise the polygon array
	this.cityPolys = [];
	// Seed the random number generator
	this.random.seed = this.randomSeed;
	// Instantiate a new city
	this.city = new URBGEN.City();
	// Build the initial polygon
	var topLeft = new URBGEN.Point(0, 0, 0);
	var topRight = new URBGEN.Point(this.cityWidth, 0, 0);
	var bottomLeft = new URBGEN.Point(1, this.cityDepth, 0);
	var bottomRight = new URBGEN.Point(this.cityWidth - 1, this.cityDepth, 0);
	var poly = new URBGEN.Poly(topLeft, topRight, bottomLeft, bottomRight);
	poly.makeSimple();
	this.cityPolys.push(poly);
	// Add the corners to the nodes graph
	this.nodes = [ topLeft, topRight, bottomLeft, bottomRight ];
	// Set the city's polygon
	this.city.poly = poly;
	// Set the city's area
	this.city.area = URBGEN.Util.areaPoly(poly);
	// Set the regularity params
	this.regularity1 = this.globalAngle
	* (URBGEN.Constants.MAX_REGULARITY - URBGEN.Constants.MIN_REGULARITY)
	+ URBGEN.Constants.MIN_REGULARITY;
	this.regularity2 = URBGEN.Constants.MAX_REGULARITY
	- this.globalAngle
	* (URBGEN.Constants.MAX_REGULARITY - URBGEN.Constants.MIN_REGULARITY);
};
/**
 * Recursively processes an array of polygons.
 * @param {Array.<URBGEN.Point>} - The array of polygons to be processed.
 * @return {Array<URBGEN.Poly>} The new polygons.
 */
URBGEN.Generator.prototype.processPolyRecursively = function(polys) {
	var newPolys = [];
	for ( var i = 0; i < polys.length; i++) {
		newPolys = newPolys.concat(this.processPoly(polys[i]));
	}
	if (polys.length !== newPolys.length) {
		return this.processPolyRecursively(newPolys);
	}
	return newPolys;
};
/**
 * Generates a city.
 * @param {Object} cityParams - The parameters that should be used to generate
 *     the city.
 * @return {URBGEN.City} The generated city.
 */
URBGEN.Generator.prototype.generate = function(cityParams) {
	this.setParams(cityParams);
	this.init();
	// Get the initial polygons
	this.cityPolys = this.processPolyRecursively(this.cityPolys);
	// Build the city blocks.
	for ( var i = 0; i < this.cityPolys.length; i++) {
		//TODO this doesn't add every node yet
		this.city.roads.push(this.cityPolys[i].corners[0]);
		var poly = this.cityPolys[i];
		var block = new URBGEN.Block(poly, this.streetWidth);
		this.city.blocks.push(block);
	}
	// Build the plots
	for ( var j = 0; j < this.city.blocks.length; j++) {
		var plots = [];
		this.plotBuilder.poly = this.city.blocks[j].innerPoly;
		var plotPolys = this.director.execute(this.plotBuilder);
		for ( var k = 0; k < plotPolys.length; k++) {
			plot = new URBGEN.Plot(plotPolys[k]);
			plot.height = this.random.next() * 20 + 20;
			plots.push(plot);
		}
		this.city.blocks[j].plots = plots;
	}
	// Build the 3D geometry
	this.buildGeometry();
	//return the city
	return this.city;
};
/**
 * Builds a 3D geometry for this generator's current city.
 */
URBGEN.Generator.prototype.buildGeometry = function() {
	var vertices = this.city.geometry.vertices;
	var faces = this.city.geometry.faces;
	var plots = this.city.getPlots();
	for ( var i = 0; i < plots.length; i++) {
		var building = plots[i].poly;
		var height = plots[i].height;
		for ( var j = 0; j < building.corners.length; j++) {
			var vertex = building.corners[j];
			vertices.push([ vertex.x, vertex.y, height ]);
		}
		for ( var k = 0; k < building.corners.length; k++) {
			var vertex = building.corners[k];
			vertices.push([ vertex.x, vertex.y, 0 ]);
		}
	}
	for ( var l = 1; l < vertices.length + 1; l += 8) {
		faces.push([ l, l + 1, l + 2 ]);
		faces.push([ l + 2, l + 1, l + 3 ]);
		faces.push([ l, l + 1, l + 4 ]);
		faces.push([ l + 4, l + 1, l + 5 ]);
		faces.push([ l + 1, l + 3, l + 5 ]);
		faces.push([ l + 5, l + 3, l + 7 ]);
		faces.push([ l + 3, l + 2, l + 7 ]);
		faces.push([ l + 7, l + 2, l + 6 ]);
		faces.push([ l + 2, l, l + 6 ]);
		faces.push([ l + 6, l, l + 4 ]);
	}
};
/**
 * Processes a polygon. If a polygon cannot be processed, it is returned.
 * @param {URBGEN.Poly} poly - The polygon to process.
 * @return {Array.<URBGEN.Poly>} The new polygons, or the original poly.
 */
URBGEN.Generator.prototype.processPoly = function(poly) {
	if (URBGEN.Util.areaPoly(poly) < this.blockSize) {
		return [ poly ];
	}
	this.prepare(poly);
	try {
		var newPolys = this.director.execute(this.builder, this.center);
		return newPolys;
	} catch (error) {
		if (error instanceof URBGEN.Exception.EdgeTooShortException) {
			return [ poly ];
		}
	}
};
/**
 * Prepares to process a polygon by loading the appropriate Builder.
 * @param {URBGEN.Poly} poly - The polygon being prepared for.
 */
URBGEN.Generator.prototype.prepare = function(poly) {
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
/**
 * Returns a THREE.Shape representing the specified poly.
 * @param {URBGEN.Poly) poly - The poly providing the coordinates.
 * @param {THREE.Shape} shape - The shape to have its coordinates set.
 * @return {THREE.Shape} The shape with coordinates set.
 */
URBGEN.Generator.prototype.buildThreeShape = function(poly, shape) {
	shape.moveTo(poly.corners[0].x, poly.corners[0].y);
	shape.lineTo(poly.corners[1].x, poly.corners[1].y);
	shape.lineTo(poly.corners[3].x, poly.corners[3].y);
	shape.lineTo(poly.corners[2].x, poly.corners[2].y);
	shape.lineTo(poly.corners[0].x, poly.corners[0].y);
	return shape;
};
/**
 * Returns a string containing vertex and face data in the Wavefront.OBJ file
 * format. The geometry returned represents bounding boxes for each plot in
 * this generator's current city.
 * @return {string} The OBJ data for this generator's current city.
 */
URBGEN.Generator.prototype.OBJData = function() {
	var geom = this.city.geometry;
	var verts = geom.vertices;
	var faces = geom.faces;
	var output = "";
	for ( var v = 0; v < verts.length; v++) {
		output += "v " + verts[v][0] + " " + verts[v][1] + " " + verts[v][2]
		+ '\n';
	}
	for ( var f = 0; f < faces.length; f++) {
		output += "f " + faces[f][0] + " " + faces[f][1] + " " + faces[f][2]
		+ '\n';
	}
	return output;
};
/**
 * Returns a string containing the parameters used to generate this generator's
 * current city.
 * @return {string} The parameters used to generate this generator's current city.
 */
URBGEN.Generator.prototype.paramData = function() {
	var output = ("globalAngle: " + this.globalAngle + ",\n" + "blockSize: "
			+ this.blockSize + ",\n" + "cityWidth: " + this.cityWidth + ",\n"
			+ "cityDepth: " + this.cityDepth + ",\n" + "streetWidth: "
			+ this.streetWidth + ",\n" + "localGrids: " + this.localGrids
			+ ",\n" + "randomSeed: " + this.randomSeed + ",\n"
			+ "throughRoads: " + this.throughRoads);
	return output;
};

//URBGEN.Builder

/**
 * Represents a builder.
 * @constructor
 * @param {URBGEN.Generator} generator - The generator that owns this builder.
 */
URBGEN.Builder = function(generator) {
	this.generator = generator;
	this.poly;
	this.origin;
	this.endPoint;
	this.newPoints = [];
};
/**
 * Returns an array of new polygons created from this builder's current points.
 * @return {Array.<URBGEN.Poly>} The new polygons.
 * @throws {URBGEN.Exception.EdgeTooShortException}
 */
URBGEN.Builder.prototype.buildPolys = function() {
	var polys = [];
	for ( var i = 0; i < this.newPoints.length; i++) {
		// Build the new polygon
		var points = this.newPoints[i];
		var poly = new URBGEN.Poly(points[0], points[1], points[2], points[3]);
		// Set the grid angle of the new polygon, if needed
		var localGridThreshold = this.generator.localGrids
		* this.generator.city.area;
		if (URBGEN.Util.areaPoly(poly) < localGridThreshold) {
			if (this.poly.gridAngle === undefined) {
				poly.setGridAngle(this.generator.random.next());
			} else {
				poly.gridAngle = this.poly.gridAngle;
			}
		}
		// Add the polygon
		polys.push(poly);
	}
	for ( var j = 0; j < polys.length; j++) {
		for ( var k = 0; k < polys[j].edgeLengths.length; k++) {
			var length = polys[j].edgeLengths[k];
			if (length < this.minEdgeLength) {
				throw new URBGEN.Exception.EdgeTooShortException();
			}
		}
	}
	return polys;
};
/**
 * Sets this builder's origin and end points for the new dividing line.
 * @throws {URBGEN.Exception.EdgeTooShortException}
 */
URBGEN.Builder.prototype.setUp = function() {
	var edgeStart = this.poly.corners[0];
	var edgeEnd = this.poly.corners[this.corners[0]];
	var edgeLength = URBGEN.Util.getLineSegmentLength(edgeStart, edgeEnd);
	var origin;
	var endPoint;
	if (this.poly.gridAngle === undefined) {
		origin = this.pointByRValue(edgeStart, edgeEnd,
				this.generator.regularity1);
		this.origin = this.addPointToPath(origin, edgeStart, edgeEnd);
		edgeStart = this.poly.corners[this.corners[1]];
		edgeEnd = this.poly.corners[3];
		edgeLength = URBGEN.Util.getLineSegmentLength(edgeStart, edgeEnd);
		endPoint = this.pointByRValue(edgeStart, edgeEnd,
				this.generator.regularity2);
		this.endPoint = this.addPointToPath(endPoint, edgeStart, edgeEnd);
	} else {
		origin = this.pointByRValue(edgeStart, edgeEnd,
				this.generator.regularity1);
		this.origin = this.addPointToPath(origin, edgeStart, edgeEnd);
		edgeStart = this.poly.corners[this.corners[1]];
		edgeEnd = this.poly.corners[3];
		endPoint = this.pointByAngle(edgeStart, edgeEnd, this.getGridAngle());
		this.endPoint = this.addPointToPath(endPoint, edgeStart, edgeEnd);
	}
};
/**
 * Returns the point at which a line at the specified angle intersects with the
 * edge defined by the specified start and end points. If this point does not lie
 * on the legal part of the edge (defined as a region starting at the minimum
 * edge length from the start point and ending at the minium edge length before
 * the end point) then the closest point in the legal region is returned.
 * @param {URBGEN.Point} edgeStart - The start point of the edge.
 * @param {URBGEN.Point} edgeEnd - The end point of the edge.
 * @param {number} angle - The angle in radians of the intersecting line.
 * @return {URBGEN.Point} The closest legal point at which the intersecting line
 *     meets the edge.
 * @throws {URBGEN.Exception.EdgeTooShortException}
 */
URBGEN.Builder.prototype.pointByAngle = function(edgeStart, edgeEnd, angle) {
	// Get the edge's length
	var length = URBGEN.Util.getLineSegmentLength(edgeStart, edgeEnd);
	// Throw an error if the edge is too short
	if (length <= URBGEN.Constants.MIN_EDGE_LENGTH) {
		throw new URBGEN.Exception.EdgeTooShortException();
	}
	var minR = URBGEN.Constants.MIN_EDGE_LENGTH / length;
	var edgeAngle = URBGEN.Util.getAngle(edgeStart, edgeEnd);
	var point = URBGEN.Util.getIntersect(edgeStart, edgeAngle, this.origin,
			angle);
	var r = URBGEN.Util.getPointAsRatio(point, edgeStart, edgeEnd);
	if (r < minR)
		r = minR;
	if (r > 1 - minR)
		r = 1 - minR;
	return this.pointByRValue(edgeStart, edgeEnd, r);
};
/**
 * Returns the point represented by the specified r value on the edge defined by
 * the specified start and end points. If this point does not lie on the legal
 * part of the edge (defined as a region starting at the minimum edge length from
 * the start point and ending at the minium edge length before the end point) then
 * the closest point in the legal region is returned.
 * @param {URBGEN.Point} edgeStart - The start point of the edge.
 * @param {URBGEN.Point} edgeEnd - The end point of the edge.
 * @param {number} r - The r value of the new point.
 * @return {URBGEN.Point} The closest legal point at which the intersecting line
 *     meets the edge.
 * @throws {URBGEN.Exception.EdgeTooShortException}
 */
URBGEN.Builder.prototype.pointByRValue = function(edgeStart, edgeEnd, r) {
	// Get the edge's length
	var length = URBGEN.Util.getLineSegmentLength(edgeStart, edgeEnd);
	// Throw an error if the edge is too short
	if (length <= URBGEN.Constants.MIN_EDGE_LENGTH) {
		throw new URBGEN.Exception.EdgeTooShortException();
	}
	// Work out the legal part of the edge as a range (0 < range < 1)
	var minR = URBGEN.Constants.MIN_EDGE_LENGTH / length;
	var range = 1 - 2 * minR;
	// Use the regularity1 to find a point on this range
	var pointR = range * r + minR;
	// Get the actual point
	var point = URBGEN.Util.linearInterpolate(edgeStart, edgeEnd, pointR);
	return point;
};
/**
 * Adds the specified point to the edge with the specified start and end points.
 * If there is already a point on this edge within the current throughRoad
 * distance, returns that point. Otherwise, finds the new point's neighbors on
 * the edge, sets the neighbor relations to include the new point, and returns
 * that point.
 * @param {URBGEN.Point} point - The point to be added to the edge.
 * @param {URBGEN.Point} edgeStart - The start point of the edge.
 * @param {URBGEN.Point} edgeEnd - The end point of the edge.
 * @return {URBGEN.Point} A point within the throughRoad distance on the edge,
 *     or the originally specified point (with neighbor relations set).
 */
URBGEN.Builder.prototype.addPointToPath = function(point, edgeStart, edgeEnd) {
	var path = URBGEN.Util.getDirectedPath(edgeStart, edgeEnd, this.direction);
	var distance = this.generator.throughRoads;
	var nearPoint = URBGEN.Util.checkNearPoints(point, path, distance, false);
	if (nearPoint === point) {
		var neighbors = URBGEN.Util.getNeighbors(point, path);
		URBGEN.Util.insertPoint(point, neighbors.prev, neighbors.nxt);
	}
	return nearPoint;
};
/**
 * Represents a horizontal builder.
 * @constructor
 * @param {URBGEN.Generator} generator - The generator that owns this builder.
 */
URBGEN.Builder.HorizontalBuilder = function(generator) {
	URBGEN.Builder.call(this, generator);
	this.corners = [ 2, 1 ];
	this.direction = 2;
	this.minEdgeLength = URBGEN.Constants.MIN_EDGE_LENGTH;
};
/**
 * Creates a HorizontalBuilder prototype that inherits from Builder.prototype.
 */
URBGEN.Builder.HorizontalBuilder.prototype = Object
.create(URBGEN.Builder.prototype);
/**
 * Sets the constructor to refer to HorizontalBuilder
 */
URBGEN.Builder.HorizontalBuilder.prototype.constructor = URBGEN.Builder.HorizontalBuilder;
/**
 * Returns this builder's current poly's grid angle.
 * @return {number} The grid angle.
 */
URBGEN.Builder.HorizontalBuilder.prototype.getGridAngle = function() {
	return this.poly.gridAngle;
};
/**
 * Sets this builder's current new points.
 */
URBGEN.Builder.HorizontalBuilder.prototype.setNewPoints = function(data) {
	this.origin.neighbors[3] = this.endPoint;
	this.endPoint.neighbors[1] = this.origin;
	this.newPoints = [
	                  [ this.poly.corners[0], this.poly.corners[1], this.origin,
	                    this.endPoint ],
	                    [ this.origin, this.endPoint, this.poly.corners[2],
	                      this.poly.corners[3] ] ];
};
/**
 * Represents a vertical builder.
 * @constructor
 * @param {URBGEN.Generator} generator - The generator that owns this builder.
 */
URBGEN.Builder.VerticalBuilder = function(generator) {
	URBGEN.Builder.call(this, generator);
	this.corners = [ 1, 2 ];
	this.direction = 3;
	this.minEdgeLength = URBGEN.Constants.MIN_EDGE_LENGTH;
};
/**
 * Creates a VerticalBuilder prototype that inherits from Builder.prototype.
 */
URBGEN.Builder.VerticalBuilder.prototype = Object
.create(URBGEN.Builder.prototype);
/**
 * Sets the constructor to refer to VerticalBuilder
 */
URBGEN.Builder.VerticalBuilder.prototype.constructor = URBGEN.Builder.VerticalBuilder;
/**
 * Returns this builder's current poly's grid angle + 0.5 * Math.PI.
 * @return {number} The orthogonal grid angle.
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
	                  [ this.poly.corners[0], this.origin, this.poly.corners[2],
	                    this.endPoint ],
	                    [ this.origin, this.poly.corners[1], this.endPoint,
	                      this.poly.corners[3] ] ];
};
/**
 * Represents a plot builder.
 * @constructor
 * @param {URBGEN.Generator} generator - The generator that owns this builder.
 */
URBGEN.Builder.PlotBuilder = function(generator) {
	URBGEN.Builder.call(this, generator);
	this.innerPaths = [];
	this.outerPaths = [];
	this.minEdgeLength = 0;
};
/**
 * Creates a PlotBuilder prototype that inherits from Builder.prototype.
 */
URBGEN.Builder.PlotBuilder.prototype = Object.create(URBGEN.Builder.prototype);
/**
 * Sets the constructor to refer to PlotBuilder
 */
URBGEN.Builder.PlotBuilder.prototype.constructor = URBGEN.Builder.PlotBuilder;
/**
 * Sets the inner and outer paths that define this builder's plots.
 */
URBGEN.Builder.PlotBuilder.prototype.setUp = function() {
	var minL = Math.min(this.poly.edgeLengths[0], this.poly.edgeLengths[1],
			this.poly.edgeLengths[2], this.poly.edgeLengths[3]);
	var innerInset = 10;
	var innerPoly = URBGEN.Util.insetPoly(this.poly, innerInset);
	innerPoly.makeSimple();
	// Get the inner edges
	var innerEdges = [ [ innerPoly.corners[0], innerPoly.corners[1] ],
	                   [ innerPoly.corners[1], innerPoly.corners[3] ],
	                   [ innerPoly.corners[0], innerPoly.corners[2] ],
	                   [ innerPoly.corners[2], innerPoly.corners[3] ] ];
	// get the outer edges
	var outerEdges = [ [ this.poly.corners[0], this.poly.corners[1] ],
	                   [ this.poly.corners[1], this.poly.corners[3] ],
	                   [ this.poly.corners[0], this.poly.corners[2] ],
	                   [ this.poly.corners[2], this.poly.corners[3] ], ];
	// shorter the outer edges to match the inner edges
	for ( var i = 0; i < innerEdges.length; i++) {
		var angle = URBGEN.Util.getAngle(innerEdges[i][0], innerEdges[i][1]);
		angle = URBGEN.Util.addAngle(angle, 0.5);
		var outerAngle = URBGEN.Util.getAngle(outerEdges[i][0],
				outerEdges[i][1]);
		var l = URBGEN.Util.getLineSegmentLength(innerEdges[i][0],
				innerEdges[i][1]);
		var start = URBGEN.Util.getIntersect(innerEdges[i][0], angle,
				outerEdges[i][0], outerAngle);
		var end = URBGEN.Util.linearInterpolateByLength(start,
				outerEdges[i][1], l);
		outerEdges[i][0] = start;
		outerEdges[i][1] = end;
	}
	// set neighbor relations of the edge's start and end points
	var direction = 2;
	var oppDirection = (direction + 2) % 4;
	for ( var i = 0; i < outerEdges.length; i++) {
		var p = outerEdges[i][0];
		var q = outerEdges[i][1];
		p.neighbors[direction] = q;
		q.neighbors[oppDirection] = p;
		if (direction === 2) {
			direction = 3;
		} else {
			direction = 2;
		}
		oppDirection = (direction + 2) % 4;
	}
	// Get the paths
	var innerPaths = [];
	var outerPaths = [];
	for ( var j = 0; j < outerEdges.length; j++) {
		var length = 10;
		innerPaths.push(URBGEN.Util.divideLine(innerEdges[j][0],
				innerEdges[j][1], length));
		outerPaths.push(URBGEN.Util.divideLine(outerEdges[j][0],
				outerEdges[j][1], length));
	}
	this.innerPaths = innerPaths;
	this.outerPaths = outerPaths;
};
/**
 * Sets this builder's current new points.
 */
URBGEN.Builder.PlotBuilder.prototype.setNewPoints = function(data) {
	var newPoints = [];
	for ( var i = 0; i < this.innerPaths.length; i++) {
		for ( var j = 0; j < this.innerPaths[i].length - 1; j++) {
			newPoints.push([ this.outerPaths[i][j], this.outerPaths[i][j + 1],
			                 this.innerPaths[i][j], this.innerPaths[i][j + 1] ]);
		}
	}
	// add the corner plots
	newPoints.push([ this.poly.corners[0], this.outerPaths[0][0],
	                 this.outerPaths[2][0], this.innerPaths[0][0] ]);
	newPoints
	.push([ this.outerPaths[0][this.outerPaths[0].length - 1],
	        this.poly.corners[1], this.innerPaths[1][0],
	        this.outerPaths[1][0] ]);
	newPoints.push([ this.outerPaths[2][this.outerPaths[2].length - 1],
	                 this.innerPaths[2][this.innerPaths[2].length - 1],
	                 this.poly.corners[2], this.outerPaths[3][0] ]);
	newPoints.push([ this.innerPaths[1][this.innerPaths[1].length - 1],
	                 this.outerPaths[1][this.outerPaths[1].length - 1],
	                 this.outerPaths[3][this.outerPaths[3].length - 1],
	                 this.poly.corners[3] ]);

	this.newPoints = newPoints;
};
/**
 * Represents a director.
 * @constructor
 */
URBGEN.Builder.Director = function() {

};
/**
 * Invokes the specified builder's build methods.
 * @return {Array.<URBGEN.Poly>} The result of the builder's buildPolys() method.
 */
URBGEN.Builder.Director.prototype.execute = function(builder) {
	builder.setUp();
	builder.setNewPoints();
	return builder.buildPolys();
};

//URBGEN.Util

URBGEN.Util = {};
/**
 * Returns the length of the line segment p0p1.
 * @param {URBGEN.Point} p0 - the start point of the line segment.
 * @param {URBGEN.Point} p1 - the end point of the line segment.
 * @return {number} The length of the line segment.
 */
URBGEN.Util.getLineSegmentLength = function(p0, p1) {
	return Math.sqrt(Math.pow((p1.x - p0.x), 2) + Math.pow((p1.y - p0.y), 2));
};
/**
 * Returns a point on the line segment p0p1 which is the specified length along
 * the line.
 * @param {URBGEN.Point} p0 - The start point of the line.
 * @param {URBGEN.Point} p1 - The end point of the line.
 * @param {number} length - The length along the line of the new point.
 * @return {URBGEN.Point} The new point.
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
 * Finds a point on the line segment p0p1 using the r value (ratio of the line).
 * @param {URBGEN.Point} p0 - The start point of the line.
 * @param {URBGEN.Point} p1 - The end point of the line.
 * @param {number} r - The r value of the new point.
 * @return {URBGEN.Point} The new point.
 */
URBGEN.Util.linearInterpolate = function(p0, p1, r) {
	var x = (1 - r) * p0.x + r * p1.x;
	var y = (1 - r) * p0.y + r * p1.y;
	var z = (1 - r) * p0.z + r * p1.z;
	return new URBGEN.Point(x, y, z);
};
/**
 * Returns the angle of the line segment p0p1 in radians.
 * @param {URBGEN.Point} p0 - The start point of the line segment.
 * @param {URBGEN.Point} p1 - The end point of the line segment.
 * @return {number} The angle in radians of the line segment.
 */
URBGEN.Util.getAngle = function(p0, p1) {
	var x1 = p0.x;
	var x2 = p1.x;
	var y1 = p0.y;
	var y2 = p1.y;
	if (y1 === y2) {
		if (x2 > x1) {
			return 0;
		} else {
			return Math.PI;
		}
	}
	var angle = Math.atan2((y2 - y1), (x2 - x1));
	if (y2 > y1) {
		return angle;

	} else {
		return (2 * Math.PI) + angle;
	}
};
/**
 * Adds the specified dA (dA * Pi) to the specified angle. The result is
 * normalized to a value between 0 and 2 * Pi radians.
 * @param {number} angle - The angle in radians.
 * @param {number} dA - The factor of PI to add to the angle.
 * @return {number} The resultant angle in radians.
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
 * @param {URBGEN.Point} point - The point.
 * @param {URBGEN.Point} p0 - A point on the line.
 * @param {URBGEN.Point} p1 - a different point on the line.
 * @return {number} The r value (ratio) of the point on the line.
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
 * Returns the area of the specified polygon.
 * @param {URBGEN.Poly} poly - The polygon.
 * @return {number} The polygon's area.
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
 * @param {URBGEN.Point} p0 - The start point of the path.
 * @param {URBGEN.Point} p1 - The end point of the path.
 * @param {number} direction - The direction of the path.
 * @param {number} maxSteps - The maximum number of iterations.
 * @return {Array.<URBGEN.Point>} The path from p0 t0 p1.
 */
URBGEN.Util.getDirectedPath = function(p0, p1, direction, maxSteps) {
	var points = [ p0 ];
	var i = 0;
	while (points[i] !== p1) {
		points.push(points[i].neighbors[direction]);
		i++;
		if (i === 1000)
			return undefined;
	}
	return points;
};
/**
 * Given two lines, defined by a point on the line and the angle of the line,
 * returns the point at which the two lines intersect. If the lines are colinear,
 * returns p1.
 * @param {URBGEN.Point} p0 - The start point of the first line.
 * @param {number} a0 - The angle in radians of the first line.
 * @param {URBGEN.Point} p1 - The start point of the second line.
 * @param {number} a1 - The angle in radians of the second line.
 * @return {URBGEN.Point} The intersection of the two lines.
 */
URBGEN.Util.getIntersect = function(p0, a0, p1, a1) {
	var m0 = Math.tan(a0);
	var m1 = Math.tan(a1);
	var x;
	var y;
	var point;
	// Check if the lines are colinear
	if (m0 === m1)
		return p0;
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
 * Returns a path of equidistant points on the linesegment p0p1. Note that the
 * distance between the second last point and the end point (p1) can be of
 * any length.
 * @param {URBGEN.Point} p0 - The start point of the line segment.
 * @param {URBGEN.Point} p1 - The end point of the line segment.
 * @param {number} length - The distance between each point in the path.
 * @return {Array.<URBGEN.Point>} The path of equidistant points.
 * @throws {URBGEN.Exception.PointsNotNeighborsException}
 */
URBGEN.Util.divideLine = function(p0, p1, length) {
	if (p0.neighbors.indexOf(p1) === -1) {
		throw new URBGEN.Exception.PointsNotNeighborsException();
	}
	var points = [ p0 ];
	var i = 0;
	var currentLineLength = URBGEN.Util.getLineSegmentLength(points[i], p1);
	while (length * 2 <= currentLineLength) {
		points.push(URBGEN.Util
				.linearInterpolateByLength(points[i], p1, length));
		i++;
		currentLineLength = URBGEN.Util.getLineSegmentLength(points[i], p1);
	}
	points.push(p1);
	return points;
};
/**
 * Returns a point representing the unit vector from p0 in the specified angle.
 * @param {URBGEN.Point} p0 - The start point of the unit vector.
 * @param {number} angle - The anlge in radians of the unit vector.
 * @return {URBGEN.Point} The unit vector.
 */
URBGEN.Util.unitVectorByAngle = function(p0, angle) {
	var dY = Math.tan(angle);
	var point = new URBGEN.Point(p0.x + 1, p0.y + dY);
	return URBGEN.Util.unitVector(p0, point);
};
/**
 * Returns a point representing the unit vector for the line segment p0p1.
 * @param {URBGEN.Point} p0 - The start point of the line segment.
 * @param {URBGEN.Point} p1 - The end point of the line segment.
 * @return {URBGEN.Point} The unit vector.
 */
URBGEN.Util.unitVector = function(p0, p1) {
	var point = URBGEN.Util.linearInterpolateByLength(p0, p1, 1);
	var unit = new URBGEN.Point(point.x - p0.x, point.y - p0.y, 0);
	return unit;

};
/**
 * Returns the unit normal for the line segment p0p1.
 * @param {URBGEN.Point} p0 - The start point of the line segment.
 * @param {URBGEN.Point} p1 - The end point of the line segment.
 * @return {URBGEN.Point} The unit normal.
 */
URBGEN.Util.unitNormal = function(p0, p1) {
	var unitVector = URBGEN.Util.unitVector(p0, p1);

	var unitNormal = new URBGEN.Point(-unitVector.y, unitVector.x, 0);
	return unitNormal;
};
/**
 * Returns a path representing the (right) offset of the line segment p0p1.
 * @param {URBGEN.Point} p0 - The start point of the line segment.
 * @param {URBGEN.Point} p1 - The end point of the line segment.
 * @param {number} distance - The distance to offset the line to the right.
 * @return {Array.<URBGEN.Point>} Array containing the start and end points of
 *     the offset line segment.
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
	return [ p0Offset, p1Offset ];
};
/**
 * Returns an inward offset of the specified polygon. That is, the returned
 * polygon is formed by insetting the edges of the specified polygon.
 * @param {URGBEN.Poly} poly - The poly to offset.
 * @param {number} length - The distance of the inward offset.
 * @return {URBGEN.Poly} The offset polygon.
 */
URBGEN.Util.insetPoly = function(poly, length) {
	// Get the edges
	var edges = [ [ poly.corners[0], poly.corners[1] ],
	              [ poly.corners[1], poly.corners[3] ],
	              [ poly.corners[3], poly.corners[2] ],
	              [ poly.corners[2], poly.corners[0] ] ];
	// Get the offset edges and angles
	var offsetEdges = [];
	var angles = [];
	for ( var i = 0; i < edges.length; i++) {
		offsetEdges.push(URBGEN.Util.offsetLineSegment(edges[i][0],
				edges[i][1], length))
				angles.push(URBGEN.Util.getAngle(offsetEdges[i][0], offsetEdges[i][1]));
	}
	// Find the new corners
	var tl = URBGEN.Util.getIntersect(offsetEdges[0][0], angles[0],
			offsetEdges[3][0], angles[3]);
	var tr = URBGEN.Util.getIntersect(offsetEdges[1][0], angles[1],
			offsetEdges[0][0], angles[0]);
	var bl = URBGEN.Util.getIntersect(offsetEdges[3][0], angles[3],
			offsetEdges[2][0], angles[2]);
	var br = URBGEN.Util.getIntersect(offsetEdges[2][0], angles[2],
			offsetEdges[1][0], angles[1]);
	return new URBGEN.Poly(tl, tr, bl, br);
};
/**
 * Sets the neighbor relations of p0 and p1 with the newPoint. If p0 and p1 are
 * not neighbors, returns false, otherwise true.
 * @param {URBGEN.Point} newPoint - The new point.
 * @param {URBGEN.Point} p0 - The first neighbor point.
 * @param {URNGEN.Point} p1 - The second neighbor point.
 * @return {boolean} True if successful, false otherwise.
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
 * Returns the specified the two points closest in opposite directions to the
 * specified point.
 * @param {URBGEN.Point} point - The point to find neighbors for.
 * @param {Array.<URBGEN.Point>} - The path of potential neighbors.
 * @return {Object} The prev and nxt points to the specified point.
 * @throws {URBGEN.Exception.PointOutOfRangeException}
 */
URBGEN.Util.getNeighbors = function(point, points) {
	var neighbors = {
			prev : undefined,
			nxt : undefined
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
		throw new URBGEN.Exception.PointOutOfRangeException();
	}
	for ( var i = 1; i < points.length; i++) {
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
 * @param {URBGEN.Point} point - The point to find near points for.
 * @param {Array.<URBGEN.Point>} - The path of potential near points.
 * @param {number} distance - The distance within which near points can be found.
 * @param {boolean} includeEnds - true if the start and end points should be
 *     included, false if not.
 * @return {URBGEN.Point} The closest point to the specified point, or the
 *     original point is no such near point exists.
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
 * @param {Array.<URBGEN.Point>} points - The points in which to look for the
 *     closest point.
 * @param {URBGEN.Point} target - The target point.
 * @return {URBGEN.Point} The point that is closest to the target.
 */
URBGEN.Util.nearest = function(points, target) {
	var index = 0;
	var shortest = URBGEN.Util.getLineSegmentLength(points[0], target);
	for ( var i = 1; i < points.length; i++) {
		var length = URBGEN.Util.getLineSegmentLength(points[i], target);
		if (length < shortest) {
			index = i;
			shortest = length;
		}
	}
	return points[index];
}

//URBGEN.Math

URBGEN.Math = {};
/**
 * Represents a psuedorandom number generator with the specified seed.
 * @constructor
 */
URBGEN.Math.Random = function(seed) {
	this.seed = seed || Math.random();
};
/**
 * Returns the next psuedorandom number (0 - 1) for this psuedorandom number
 * generator.
 * @return {number} The next pseudorandom number for this generator.
 */
URBGEN.Math.Random.prototype.next = function() {
	this.seed = (this.seed * 9301 + 49297) % 233280;
	return this.seed / 233280;
};

//URBGEN.Constants

URBGEN.Constants = {};
URBGEN.Constants.MAX_BLOCK_SIZE = 50000;
URBGEN.Constants.MIN_BLOCK_SIZE = 15000;
URBGEN.Constants.MAX_REGULARITY = 0.6;
URBGEN.Constants.MIN_REGULARITY = 0.4;
URBGEN.Constants.MAX_CITY_WIDTH = 2000;
URBGEN.Constants.MIN_CITY_WIDTH = 400;
URBGEN.Constants.MAX_CITY_DEPTH = 2000;
URBGEN.Constants.MIN_CITY_DEPTH = 400;
URBGEN.Constants.MAX_THROUGH_ROADS = 50;
URBGEN.Constants.MIN_THROUGH_ROADS = 0;
URBGEN.Constants.MAX_STREET_WIDTH = 30;
URBGEN.Constants.MIN_STREET_WIDTH = 10;
URBGEN.Constants.MAX_RANDOM_SEED = 1;
URBGEN.Constants.MIN_RANDOM_SEED = 0;
URBGEN.Constants.MAX_LOCAL_GRIDS = 1;
URBGEN.Constants.MIN_LOCAL_GRIDS = 0;
URBGEN.Constants.MAX_GLOBAL_ANGLE = 1;
URBGEN.Constants.MIN_GLOBAL_ANGLE = 0;
URBGEN.Constants.MIN_EDGE_LENGTH = 80;

//URBGEN.Exception
URBGEN.Exception = {};
/**
 * Represents an illegal argmument exception.
 * @constructor
 */
URBGEN.Exception.IllegalArgumentException = function(message) {
	this.name = "IllegalArgumentException";
	this.message = message || "Illegal Argument Exception";
};
/**
 * Sets IllegalArgumentException's prototype to Error.
 */
URBGEN.Exception.IllegalArgumentException.prototype = new Error();
/**
 * Sets IllegalArgumentException's constructor.
 */
URBGEN.Exception.IllegalArgumentException.prototype.constructor = URBGEN.Exception.IllegalArgumentException;
/**
 * Represents an edge too short exception.
 * @constructor
 */
URBGEN.Exception.EdgeTooShortException = function(message) {
	this.name = "EdgeTooShortException";
	this.message = message || "Edge too short to divide";
};
/**
 * Sets EdgeTooShortException's prototype to Error.
 */
URBGEN.Exception.EdgeTooShortException.prototype = new Error();
/**
 * Sets EdgeTooShortException's constructor.
 */
URBGEN.Exception.EdgeTooShortException.prototype.constructor = URBGEN.Exception.EdgeTooShortException;
/**
 * Represents an InvalidParamException.
 * @constructor
 */
URBGEN.Exception.InvalidParamException = function(message) {
	this.name = "InvalidParamException";
	this.message = message || "Invalid parameters";
};
/**
 * Sets InvalidParamException's prototype to Error.
 */
URBGEN.Exception.InvalidParamException.prototype = new Error();
/**
 * Sets InvalidParamException's constructor.
 */
URBGEN.Exception.InvalidParamException.prototype.constructor = URBGEN.Exception.InvalidParamException;
/**
 * Represents a Points not neighbors exception.
 * @constructor
 */
URBGEN.Exception.PointsNotNeighborsException = function(message) {
	this.name = "PointsNotNeighborsException";
	this.message = message || "Points are not neighbors";
};
/**
 * Sets PointsNotNeighborsException's prototype to Error.
 */
URBGEN.Exception.PointsNotNeighborsException.prototype = new Error();
/**
 * Sets PointsNotNeighborsException's constructor
 */
URBGEN.Exception.PointsNotNeighborsException.prototype.constructor = URBGEN.Exception.PointsNotNeighborsException;
/**
 * Represents a Point out of range exception.
 * @constructor
 */
URBGEN.Exception.PointOutOfRangeException = function(message) {
	this.name = "PointOutOfRangeException";
	this.message = message || "Points lies outside allowable range";
};
/**
 * Sets PointOutOfRangeException's prototype to Error.
 */
URBGEN.Exception.PointOutOfRangeException.prototype = new Error();
/**
 * Sets PointOutOfRangeException's constructor
 */
URBGEN.Exception.PointOutOfRangeException.prototype.constructor = URBGEN.Exception.PointOutOfRangeException;