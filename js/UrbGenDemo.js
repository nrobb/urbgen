var UGDEMO = {};
//TODO add these into URBGEN
UGDEMO.convertPoly = function(poly, block) {
  block.moveTo(poly.corners[0].x, poly.corners[0].y);
  block.lineTo(poly.corners[1].x, poly.corners[1].y);
  block.lineTo(poly.corners[3].x, poly.corners[3].y);
  block.lineTo(poly.corners[2].x, poly.corners[2].y);
  block.lineTo(poly.corners[0].x, poly.corners[0].y);
  var extrusionSettings = {
    size: 30, height: 4, curveSegments: 3,
    bevelThickness: 1, bevelSize: 2, bevelEnabled: false,
    material: 0, extrudeMaterial: 1, amount: poly.height
  };
  var geom = new THREE.ExtrudeGeometry(block, extrusionSettings);
  geom.faceVertexUvs[0][2][0].set( 0, 0 );
  geom.faceVertexUvs[0][2][1].set( 0, 0 );
  geom.faceVertexUvs[0][2][2].set( 0, 0 );
  return geom;
};
UGDEMO.getCity3D = function(polys) {
  var cityGeom = new THREE.Geometry();
  var light = new THREE.Color( 0xffffff );
  var shadow    = new THREE.Color( 0xff6666 );
  for (var j = 0; j < polys.length; j++) {
    var blockGeom = UGDEMO.convertPoly(polys[j], new THREE.Shape());
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