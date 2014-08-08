var UGDEMO = {};
function getPolys() {
  var topLeft = new URBGEN.Point(10, 15, 0);
  var topRight = new URBGEN.Point(1200, 5, 0);
  var bottomLeft = new URBGEN.Point(40, 500, 0);
  var bottomRight = new URBGEN.Point(1300, 600, 0);
  var poly = new URBGEN.Poly(topLeft, topRight, bottomLeft, bottomRight);
  poly.makeSimple();
  var polys = [poly];
  var n = 1;
  for (var i = 0; i < 10; i++) {
    polys = run(polys, n++ % 2);
  }
  return polys;
}
function insetPoly(poly) {
  var length = 0.1 * Math.min(
    URBGEN.Util.getLineSegmentLength(poly.corners[0], poly.corners[1]),
    URBGEN.Util.getLineSegmentLength(poly.corners[0], poly.corners[2]),
    URBGEN.Util.getLineSegmentLength(poly.corners[1], poly.corners[3]),
    URBGEN.Util.getLineSegmentLength(poly.corners[2], poly.corners[3]));
  var newTopLeft = URBGEN.Util.getIntersect(
    URBGEN.Util.linearInterpolateByLength(poly.corners[0], poly.corners[1], length),
    URBGEN.Util.getAngle(poly.corners[0], poly.corners[2]),
    URBGEN.Util.linearInterpolateByLength(poly.corners[0], poly.corners[2], length),
    URBGEN.Util.getAngle(poly.corners[0], poly.corners[1]));
  var newTopRight = URBGEN.Util.getIntersect(
    URBGEN.Util.linearInterpolateByLength(poly.corners[0], poly.corners[1],
      URBGEN.Util.getLineSegmentLength(poly.corners[0], poly.corners[1]) - length),
    URBGEN.Util.getAngle(poly.corners[1], poly.corners[3]),
    URBGEN.Util.linearInterpolateByLength(poly.corners[1], poly.corners[3], length),
    URBGEN.Util.getAngle(poly.corners[0], poly.corners[1]));
  var newBottomLeft = URBGEN.Util.getIntersect(
    URBGEN.Util.linearInterpolateByLength(poly.corners[0], poly.corners[2],
      URBGEN.Util.getLineSegmentLength(poly.corners[0], poly.corners[2]) - length),
    URBGEN.Util.getAngle(poly.corners[2], poly.corners[3]),
    URBGEN.Util.linearInterpolateByLength(poly.corners[2], poly.corners[3], length),
    URBGEN.Util.getAngle(poly.corners[0], poly.corners[2]));
  var newBottomRight = URBGEN.Util.getIntersect(
    URBGEN.Util.linearInterpolateByLength(poly.corners[2], poly.corners[3],
      URBGEN.Util.getLineSegmentLength(poly.corners[2], poly.corners[3]) - length),
    URBGEN.Util.getAngle(poly.corners[1], poly.corners[3]),
    URBGEN.Util.linearInterpolateByLength(poly.corners[1], poly.corners[3],
      URBGEN.Util.getLineSegmentLength(poly.corners[1], poly.corners[3]) - length),
    URBGEN.Util.getAngle(poly.corners[2], poly.corners[3]));
  return new URBGEN.Poly(newTopLeft, newTopRight, newBottomLeft, newBottomRight);
}
function convertPoly(poly) {
  var block = new THREE.Shape();
  block.moveTo(poly.corners[0].x, poly.corners[0].y);
  block.lineTo(poly.corners[1].x, poly.corners[1].y);
  block.lineTo(poly.corners[3].x, poly.corners[3].y);
  block.lineTo(poly.corners[2].x, poly.corners[2].y);
  block.lineTo(poly.corners[0].x, poly.corners[0].y);
  var extrusionSettings = {
    size: 30, height: 4, curveSegments: 3,
    bevelThickness: 1, bevelSize: 2, bevelEnabled: false,
    material: 0, extrudeMaterial: 1, amount: Math.random() * 40 + 50
  };
  var geom = new THREE.ExtrudeGeometry(block, extrusionSettings);
  geom.faceVertexUvs[0][2][0].set( 0, 0 );
  geom.faceVertexUvs[0][2][1].set( 0, 0 );
  geom.faceVertexUvs[0][2][2].set( 0, 0 );
  return geom;
}
function testVertical(poly) {
  /////hack
  var length = Math.min(
    URBGEN.Util.getLineSegmentLength(poly.corners[0], poly.corners[1]),
    URBGEN.Util.getLineSegmentLength(poly.corners[0], poly.corners[2]),
    URBGEN.Util.getLineSegmentLength(poly.corners[1], poly.corners[3]),
    URBGEN.Util.getLineSegmentLength(poly.corners[2], poly.corners[3]));
  if (length < 25) return [poly];
  ///
  var director = new URBGEN.Builder.Director();
  var builder = new URBGEN.Builder.VerticalBuilder();
  poly.minEdgeLength = 5;
  poly.throughRoadStagger = 0;
  poly.density = 0.3;
  return director.execute(builder, poly);
}
function testHorizontal(poly) {
  /////hack
  var length = Math.min(
    URBGEN.Util.getLineSegmentLength(poly.corners[0], poly.corners[1]),
    URBGEN.Util.getLineSegmentLength(poly.corners[0], poly.corners[2]),
    URBGEN.Util.getLineSegmentLength(poly.corners[1], poly.corners[3]),
    URBGEN.Util.getLineSegmentLength(poly.corners[2], poly.corners[3]));
  if (length < 50) return [poly];
  ///
  var director = new URBGEN.Builder.Director();
  var builder = new URBGEN.Builder.HorizontalBuilder();
  poly.minEdgeLength = 5;
  poly.throughRoadStagger = 0;
  poly.density = 0.3;
  return director.execute(builder, poly);
}
function run(origPolys, r) {
  var ret = [];
  for (var i = 0; i < origPolys.length; i++) {
    if (r === 1) {
      ret = ret.concat(testHorizontal(origPolys[i]));
    } else {
      ret = ret.concat(testVertical(origPolys[i]));
    }
  }
  return ret;
}
UGDEMO.getCity2D = function() {
  var polys = getPolys();
  var insetPolys = [];
  for (var i = 0; i < polys.length; i++) {
    insetPolys.push(insetPoly(polys[i]));
  }
  return insetPolys;
};
UGDEMO.getCity = function() {
  var cityGeom = new THREE.Geometry();
  var polys = getPolys();
  var insetPolys = [];
  for (var i = 0; i < polys.length; i++) {
    insetPolys.push(insetPoly(polys[i]));
  }
  var light = new THREE.Color( 0xffffff );
  var shadow    = new THREE.Color( 0xff6666 );
  for (var j = 0; j < insetPolys.length; j++) {
    var blockGeom = convertPoly(insetPolys[j]);
    var value = 1 - Math.random() * Math.random();
    var baseColor   = new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );
    var topColor    = baseColor.clone().multiply( light );
    var bottomColor = baseColor.clone().multiply( shadow );
    for ( var k = 0, kl = blockGeom.faces.length; k < kl; k ++ ) {
      if ( j === 2 ) {
        blockGeom.faces[ k ].vertexColors = [ baseColor, baseColor, baseColor, baseColor ];
      } else {
        blockGeom.faces[ k ].vertexColors = [ topColor, bottomColor, bottomColor, topColor ];
      }
    }
    cityGeom.merge(blockGeom);
  }
  return cityGeom;
};