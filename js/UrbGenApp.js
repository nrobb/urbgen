/**
 * Defines a global namespace
 */
URBGEN_APP = {};
/**
 * Represents an UrbGen Web Application
 * @constructor
 */
URBGEN_APP.App = function() {
	this.view = new URBGEN_APP.View();
	this.scene = this.view.scene;
	this.generator = new URBGEN.Generator();
	this.city;
	this.generateCity({cityWidth: window.innerWidth, cityDepth: window.innerHeight});
	this.gui = this.initGui();
};
/**
 * Runs this UrbGen Web Application
 */
URBGEN_APP.App.prototype.run = function() {
	// Animate the scene
	window.requestAnimationFrame(animate);
	var lastTime = null;
	var view = this.view;
	function animate(currentTime) {
		// Keep looping
		window.requestAnimationFrame(animate, view);
		// Get the last time
		lastTime = lastTime || currentTime - 1000 / 60;
		var delta = Math.min(200, currentTime - lastTime);
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
	gui.add(this.generator, "cityWidth", URBGEN.Constants.MIN_CITY_WIDTH,
			URBGEN.Constants.MAX_CITY_WIDTH).listen();
	gui.add(this.generator, "cityDepth", URBGEN.Constants.MIN_CITY_DEPTH,
			URBGEN.Constants.MAX_CITY_DEPTH).listen();
	gui.add(this.generator, "blockSize", URBGEN.Constants.MIN_BLOCK_SIZE,
			URBGEN.Constants.MAX_BLOCK_SIZE).listen();
	gui.add(this.generator, "streetWidth", URBGEN.Constants.MIN_STREET_WIDTH,
			URBGEN.Constants.MAX_STREET_WIDTH).listen();
	gui.add(this.generator, "globalAngle", URBGEN.Constants.MIN_GLOBAL_ANGLE,
			URBGEN.Constants.MAX_GLOBAL_ANGLE).listen();
	gui.add(this.generator, "localGrids", URBGEN.Constants.MIN_LOCAL_GRIDS,
			URBGEN.Constants.MAX_LOCAL_GRIDS).listen();
	gui.add(this.generator, "throughRoads", URBGEN.Constants.MIN_THROUGH_ROADS,
			URBGEN.Constants.MAX_THROUGH_ROADS).listen();
	gui.add(this.generator, "randomSeed", URBGEN.Constants.MIN_RANDOM_SEED,
			URBGEN.Constants.MAX_RANDOM_SEED).listen();
	gui.add(this, "update").listen();
	gui.add(this, "random").listen();
	gui.add(this, "exportOBJ");
	gui.add(this, "exportParams");
	gui.closed = true;
	return gui;
};
/**
 * Updates this app's current city.
 * @param {string} cityParams - The parameters passed to the Generator.
 */
URBGEN_APP.App.prototype.generateCity = function(cityParams) {
	try {
		var d = new Date();
		var start = d.getTime();
		this.city = this.generator.generate(cityParams);
		d = new Date();
		var end = d.getTime();
		this.logCityData(start, end);
		var geometry = this.buildGeometry();
		this.view.addMeshToScene(geometry);
	} catch (error) {
		alert(URBGEN_APP.Constants.CITY_GENERATION_ERROR);
		console.log(error.message);
	}
};
/**
 * Calls this app's generateCity method with this app's generator's current
 * params.
 */
URBGEN_APP.App.prototype.update = function() {
  this.generateCity(this.generator.getParams());
};
/**
 * Calls this app's generateCity method with undefined params.
 */
URBGEN_APP.App.prototype.random = function() {
	this.generateCity();
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
	for ( var j = 0; j < plots.length; j++) {
		// get the plot
		var plot = this.generator.buildThreeShape(plots[j].poly,
				new THREE.Shape());
		// set the extrusion settings
		var extrusionSettings = {
				bevelEnabled : false,
				amount : plots[j].height
		};
		// get the building geometry
		var geom = new THREE.ExtrudeGeometry(plot, extrusionSettings);
		cityGeom.merge(geom);
	}
	/*
	// Add a ground plane
	var planeShape = this.generator.buildThreeShape(this.city.poly, new THREE.Shape());
	// set the extrusion settings
	var planeExtrusionSettings = {
	    bevelEnabled : false,
	    amount : 0
	};
	var plane = new THREE.ExtrudeGeometry(planeShape, planeExtrusionSettings);
	cityGeom.merge(plane);
	*/
	// return the city
	return cityGeom;
};
/**
 * Downloads a Wavefront.OBJ file representing this app's current city's
 * geometry.
 */
URBGEN_APP.App.prototype.exportOBJ = function() {
	var output = this.generator.OBJData();
	var blob = new Blob([ output ], {
		type : 'text/plain'
	});
	var date = new Date();
	var timeStamp = date.getTime();
	var fileName = "urbgen_model_" + timeStamp + ".obj";
	saveAs(blob, fileName);
};
/**
 * Downloads a text file containing this app's generator's current params.
 */
URBGEN_APP.App.prototype.exportParams = function() {
	var output = this.generator.paramData();
	var blob = new Blob([ output ], {
		type : 'text/plain'
	});
	var date = new Date();
	var timeStamp = date.getTime();
	var fileName = "urbgen_model_" + timeStamp + ".txt";
	saveAs(blob, fileName);
};
/**
 * Represents a view of an UrbGen Web Application.
 * @constructor
 */
URBGEN_APP.View = function() {
	this.renderer = new THREE.WebGLRenderer({
		antialias : true,
		shadowMapEnabled : true,
		shadowMapSoft : true
	});
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.setUpCamera();
	this.controls = new THREE.OrbitControls(this.camera,
			this.renderer.domElement);
	this.lastTime = undefined;
	this.scene = new THREE.Scene();
	// Add a fog to the scene
	this.scene.fog = new THREE.FogExp2(0xD9D9D3, 0.0025);
	// Set up renderer
	this.renderer.setSize(this.width, this.height);
	this.renderer.setClearColor(0xffffff, 1);
	document.body.appendChild(this.renderer.domElement);
	this.setUpLighting();
};
/**
 * Sets up a camera for this view
 */
URBGEN_APP.View.prototype.setUpCamera = function () {
	this.camera = new THREE.PerspectiveCamera(50, this.width / this.height,
			0.01, 2000);
	this.camera.position.x = 0;
	this.camera.position.z = 0;
	this.camera.position.y = 500;
};
/**
 * Sets up lighting for this view.
 */
URBGEN_APP.View.prototype.setUpLighting = function () {
  var light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
  light.position.set(0.75, 1, 0.25);
  this.scene.add(light);
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
		color : 0xffffff
	});
	var wireframeMaterial = new THREE.MeshBasicMaterial({
		color : 0x000000,
		wireframe : true
	});
	var materials = [ lambertMaterial, wireframeMaterial ];
	this.cityMesh = THREE.SceneUtils.createMultiMaterialObject(geometry,
			materials);
	// Position the mesh
	var maxX = 0;
	var maxZ = 0;
	for ( var i = 0; i < geometry.vertices.length; i++) {
		if (geometry.vertices[i].x > maxX)
			maxX = geometry.vertices[i].x;
		if (geometry.vertices[i].z > maxZ)
			maxZ = geometry.vertices[i].z;
	}
	this.cityMesh.position.x = -maxX / 2;
	this.cityMesh.position.z = maxZ * 7;
	this.cityMesh.position.y = 0;
	this.cityMesh.rotation.x = -90 * (Math.PI / 180);
	// Add the mesh to the scene
	this.scene.add(this.cityMesh);
};

//Constants
URBGEN_APP.Constants = {};
URBGEN_APP.Constants.CITY_GENERATION_ERROR = "Oops, something went wrong. "
	+ "Please change some paramsters and try again.";