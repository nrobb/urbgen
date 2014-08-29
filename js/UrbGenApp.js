URBGEN_APP = {};
/**
 * Represents an UrbGen Web Application
 * @constructor
 */
URBGEN_APP.App = function(scene) {
  this.generator = new URBGEN.Generator();
  this.gui = this.initGui();
  this.city;
  this.view = new URBGEN_APP.View();
  this.scene = this.view.scene;
  this.random();
};
/**
 * Runs this UrbGen Web Application
 */
URBGEN_APP.App.prototype.run = function() {
  // Animate the scene
	window.requestAnimationFrame(animate);
  var lastTime = null;
  var view = this.view;
	function animate(currentTime){
	  // Keep looping
		window.requestAnimationFrame(animate, view);
		// Get the last time
		lastTime = lastTime || currentTime - 1000 / 60;
		var delta	= Math.min(200, currentTime - lastTime);
		lastTime = currentTime;
		// Update
		view.update(delta);
	 }
};
/**
 * Sets up this App's GUI
 * @return {dat.gui} This app's GUI
 */
URBGEN_APP.App.prototype.initGui = function() {
  var gui = new dat.GUI();
  gui.width = 300;
  gui.add(this.generator, "cityWidth", 400, 1500).listen();
  gui.add(this.generator, "cityDepth", 400, 1500).listen();
  gui.add(this.generator, "blockSize", 15000, 50000).listen();
  gui.add(this.generator, "streetWidth", 10, 30).listen();
  gui.add(this.generator, "globalAngle", 0, 1).listen();
  gui.add(this.generator, "localGrids", 0, 1).listen();
  gui.add(this.generator, "throughRoads", 0, 50).listen();
  gui.add(this.generator, "randomSeed", 0, 1).listen();
  gui.add(this, "update").listen();
  gui.add(this, "random").listen();
  gui.add(this, "exportOBJ");
  gui.add(this, "exportParams");
  return gui;
};
/**
 * Updates this app's current city with the current generator params.
 */
URBGEN_APP.App.prototype.update = function() {
  var d = new Date();
  var start = d.getTime();
  this.generator.init();
  this.city = this.generator.generate();
  d = new Date();
  var end = d.getTime();
  this.logCityData(start, end);
  var geometry = this.buildGeometry();
  this.view.addMeshToScene(geometry);
};
/**
 * Update this app's current city with the random generator params.
 */
URBGEN_APP.App.prototype.random = function() {
  var d = new Date();
  var start = d.getTime();
  this.generator.initRandom();
  this.city = this.generator.generate();
  d = new Date();
  var end = d.getTime();
  this.logCityData(start, end);
  var geometry = this.buildGeometry();
  this.view.addMeshToScene(geometry);
};
/**
 * Logs to console the time taken to generate a city and the number of plots
 * the city contains.
 * @param {number} start - The start time in milliseconds of the city generation.
 * @param {number} end - The end time in milliseconds of the city generation.
 *
 */
URBGEN_APP.App.prototype.logCityData = function(start, end) {
  var elapsed = (end - start) / 1000;
  var numPlots = this.city.getPlots().length;
  console.log("City generated in " + elapsed + " seconds");
  console.log("City contains " + numPlots + " plots");
};
/**
 * Returs a Three.js Geometry for the this app's current city plots.
 * @return {THREE.ExtrudeGeometry} This app's current city's geometry.
 */
URBGEN_APP.App.prototype.buildGeometry = function() {
  var cityGeom = new THREE.Geometry();
  var plots = this.city.getPlots();
  // Add each building to the geometry
  for (var j = 0; j < plots.length; j++) {
    // get the plot
    var plot = this.generator.buildThreeShape(plots[j].poly, new THREE.Shape());
    // set the extrusion settings
    var extrusionSettings = {bevelEnabled: false, amount: plots[j].height};
    // get the building geometry
    var geom = new THREE.ExtrudeGeometry(plot, extrusionSettings);
    cityGeom.merge(geom);
  }
  // return the city
  return cityGeom;
};
/**
 * Downloads a Wavefront.OBJ file representing this app's current city's
 * geometry.
 */
URBGEN_APP.App.prototype.exportOBJ = function() {
  var output = this.generator.OBJData();
	var blob = new Blob([output], {type: 'text/plain' });
	var date = new Date();
	var timeStamp = date.getTime();
	var fileName = "urbgen_model_" + timeStamp +".obj";
	saveAs(blob, fileName);
};
/**
 * Downloads a text file containing this app's generator's current params.
 */
URBGEN_APP.App.prototype.exportParams = function() {
  var output = this.generator.paramData();
	var blob = new Blob([output], {type: 'text/plain'});
	var date = new Date();
	var timeStamp = date.getTime();
	var fileName = "urbgen_model_" + timeStamp +".txt";
	saveAs(blob, fileName);
};
/**
 * Represents a view of an UrbGen Web Application.
 * @constructor
 */
URBGEN_APP.View = function() {
  this.renderer = new THREE.WebGLRenderer({antialias: true});
  this.width = window.innerWidth;
  this.height = window.innerHeight;
  this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.01, 2000);
  this.light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
  this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  this.lastTime;
  this.scene = new THREE.Scene();
  // Add a fog to the scene
  this.scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025);
  // Set up renderer
	this.renderer.setSize(this.width, this.height);
	this.renderer.setClearColor(0xffffff, 1);
	document.body.appendChild(this.renderer.domElement);
	// Set up camera
	this.camera.position.x = 0;
	this.camera.position.z = 0;
	this.camera.position.y = 600;
  // Set up light
	this.light.position.set(0.75, 1, 0.25);
	this.scene.add(this.light);
};
/**
 * Updates this view's renderer and controls.
 */
URBGEN_APP.View.prototype.update = function(delta) {
  this.renderer.render(this.scene, this.camera);
  this.controls.update(delta);
};
/**
 * Creates a Three.Mesh from the specified geometry and adds it to this view's
 * current scene, removing the current mesh first.
 * @param {THREE.Geometry} geometry - The geometry used to create the mesh.
 */
URBGEN_APP.View.prototype.addMeshToScene = function(geometry) {
  // Remove the current mesh
  this.scene.remove(this.cityMesh);
  // make a mesh from the geometry
  var lambertMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff
  });
  var wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true
  });
  var materials = [lambertMaterial, wireframeMaterial];
  this.cityMesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
  // Position the mesh
  this.cityMesh.rotation.x = -90 * Math.PI / 180;
  var maxX = 0;
  var maxZ = 0;
  for (var i = 0; i < geometry.vertices.length; i++) {
    if (geometry.vertices[i].x > maxX) maxX = geometry.vertices[i].x;
    if (geometry.vertices[i].z > maxZ) maxZ = geometry.vertices[i].z;
  }
  this.cityMesh.position.x = -maxX / 2;
  this.cityMesh.position.z = maxZ * 7;
  this.cityMesh.position.y = 0;
  // Add the mesh to the scene
  this.scene.add(this.cityMesh);
};