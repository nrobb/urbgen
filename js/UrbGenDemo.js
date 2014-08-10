var UGDEMO = {};
UGDEMO.generator = new URBGEN.Generator();
UGDEMO.director = new URBGEN.Builder.Director();
UGDEMO.horizontalBuilder = new URBGEN.Builder.HorizontalBuilder();
UGDEMO.verticalBuilder = new URBGEN.Builder.VerticalBuilder();
function getPolys() {
  var topLeft = new URBGEN.Point(Math.random() * 50, Math.random() * 50, 0);
  var topRight = new URBGEN.Point(Math.random() * 50 + 500, Math.random() * 50, 0);
  var bottomLeft = new URBGEN.Point(Math.random() * 50, Math.random() * 50 + 500, 0);
  var bottomRight = new URBGEN.Point(Math.random() * 50 + 500, Math.random() * 50 + 500, 0);
  var poly = new URBGEN.Poly(topLeft, topRight, bottomLeft, bottomRight);
  poly.makeSimple();
  var polys = [poly];
  //var n = 1;
  for (var i = 0; i < 15; i++) {
    polys = run(polys, Math.round(Math.random()));
  }
  return polys;
}
function insetPoly(poly) {
  var length = 5;
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
    material: 0, extrudeMaterial: 1, amount: 0.5/*Math.random() * 30 + 10*/
  };
  var geom = new THREE.ExtrudeGeometry(block, extrusionSettings);
  geom.faceVertexUvs[0][2][0].set( 0, 0 );
  geom.faceVertexUvs[0][2][1].set( 0, 0 );
  geom.faceVertexUvs[0][2][2].set( 0, 0 );
  return geom;
}
function test(poly) {
  /////hack
  var length = Math.min(
    poly.edgeLengths[0],
    poly.edgeLengths[1],
    poly.edgeLengths[2],
    poly.edgeLengths[3]
  );
  if (URBGEN.Util.areaPoly(poly) < 10000) return [poly];
  ///
  poly.minEdgeLength = length * 0.25;
  poly.throughRoadStagger = 10;
  poly.density = URBGEN.Variables.globalCityDensity;
  return UGDEMO.generator.processPoly(poly);
}
function run(origPolys, r) {
  var ret = [];
  for (var i = 0; i < origPolys.length; i++) {
    ret = ret.concat(test(origPolys[i]));
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