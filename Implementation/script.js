//--------------------------------------------------------------------------------------------------------//
// Program main entry point
//--------------------------------------------------------------------------------------------------------//
var main=function() 
{
  var Vec3 = matrixHelper.vector3;
  var Mat4x4 = matrixHelper.matrix4;

  // Initialise context (canvas, gl)

  // Get reference to canvas
  var canvas = document.getElementById("canvas-cg-lab");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.aspect = canvas.width / canvas.height;

  // Assign context to gl
  var gl = null;
  try { gl = canvas.getContext("experimental-webgl", {antialias: true}); }
  catch (e) {alert("No webGL compatibility detected!"); return false;}

  //--------------------------------------------------------------------------------------------------------//
  // Set up scene
  //--------------------------------------------------------------------------------------------------------//
  scene = new Scene();
  scene.initialise(gl, canvas);

  //--------------------------------------------------------------------------------------------------------//
  // Set up geometry
  //--------------------------------------------------------------------------------------------------------//
  var sphere = makeSphere([0,0,0], 1, 50, 50, [0,0,0]);
		var quad = makeCuboid([0,0,0], 1, 1, 1);

		{ // SET UP GEOMETRY
				{ // WALLS
						var wallLeft = new Model();
						wallLeft.name = "wallLeft";
						wallLeft.index = quad.index;
						wallLeft.vertex = quad.vertex;
						wallLeft.compile(scene);
				
						var wallRight = new Model();
						wallRight.name = "wallRight";
						wallRight.index = quad.index;
						wallRight.vertex = quad.vertex;
						wallRight.compile(scene);

						var wallTop = new Model();
						wallTop.name = "wallTop";
						wallTop.index = quad.index;
						wallTop.vertex = quad.vertex;
						wallTop.compile(scene);
				}
				{ // PLATFORM
						var platform = new Model();
						platform.name = "platform";
						platform.index = quad.index;
						platform.vertex = quad.vertex;
						platform.compile(scene);
				}
				{ // ADD BALL
						var ball = new Model();
						ball.name = "platform";
						ball.index = sphere.index;
						ball.vertex = sphere.vertex;
						ball.compile(scene);
				}
				{ // ADD BRICKS
						var bricks = [];
						var brickRows = 3, brickColumns = 15;
						for(var r = 0; r < brickRows; ++r){
								bricks.push([]);
								for(var c = 0; c < brickColumns; ++c){
										var brick = new Model();
										brick.name = "brick".concat(r, c);
										brick.index = quad.index;
										brick.vertex = quad.vertex;
										brick.compile(scene);
										bricks[r].push(brick);
								}
						}
				}
		}

  //--------------------------------------------------------------------------------------------------------//
  // Set up lights
  //--------------------------------------------------------------------------------------------------------//
  var light = new Light();
  //light.type = Light.LIGHT_TYPE.SPOT;
  light.type = Light.LIGHT_TYPE.POINT;
  //light.type = Light.LIGHT_TYPE.DIRECTIONAL;
  light.setDiffuse([2, 2, 2]);
  light.setSpecular([1, 1, 1]);
  light.setAmbient([0.2, 0.2, 0.2]);
  light.setPosition([0, 0, 2.5]);
  light.setDirection([0, 0, -1]);
  light.setCone(0.7, 0.6);
  light.attenuation = Light.ATTENUATION_TYPE.NONE;
  light.bind(gl, scene.shaderProgram, 0);

  //--------------------------------------------------------------------------------------------------------//
  // Set up textures and materials
  //--------------------------------------------------------------------------------------------------------//
  var material = new Material();
  var textureList = new Textures();
  convertTextures(textureList);

  material.setAlbedo(gl, textureList.venus);
  material.setShininess(96.0);
  material.setSpecular([1,1,1]);
  material.setAmbient([1,1,1]);
  material.setDiffuse([1,1,1]);
  material.bind(gl, scene.shaderProgram);

  var material2 = new Material();

  material2.setAlbedo(gl, textureList.earth);
  material2.setDiffuse([1,1,1]);
  material2.setShininess(0.0);
  material2.setSpecular([0,0,0]);
  material2.setAmbient([1,1,1]);
  material2.bind(gl, scene.shaderProgram);

  var material3 = new Material();

  material3.setAlbedo(gl, textureList.earth);
  material3.setDiffuse([1,1,1]);
  material3.setShininess(8.0);
  material3.setSpecular([1,1,1]);
  material3.setAmbient([0.2,0.2,0.2]);
  material3.bind(gl, scene.shaderProgram);

  //--------------------------------------------------------------------------------------------------------//
		// GIVE MATERIALS TO OBJECTS
  //--------------------------------------------------------------------------------------------------------//
		wallLeft.material = wallRight.material = wallTop.material = material;
		platform.material = material;
		ball.material = material;
		for(var r = 0; r < brickRows; ++r){
				for(var c = 0; c < brickColumns; ++c){
						bricks[r][c].material = material3;
				}
		}

  //--------------------------------------------------------------------------------------------------------//
  // SET UP SCENE GRAPH
  //--------------------------------------------------------------------------------------------------------//
  var lightNode = scene.addNode(scene.root, light, "lightNode", Node.NODE_TYPE.LIGHT);

		{
				var scalingMatrix = Mat4x4.create(); // matrix to set scale of items
				{ // ADD WALLS
						var wallLeftNode = scene.addNode(lightNode, wallLeft, "wallLeftNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(wallLeftNode.transform, [-8,0,0]);
						Mat4x4.makeScaling(scalingMatrix, [1,10,1]);
						Mat4x4.multiply( wallLeftNode.transform, wallLeftNode.transform, scalingMatrix);

						var wallRightNode = scene.addNode(lightNode, wallRight, "wallRightNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(wallRightNode.transform, [8,0,0]);
						Mat4x4.makeScaling(scalingMatrix, [1,10,1]);
						Mat4x4.multiply( wallRightNode.transform, wallRightNode.transform, scalingMatrix);

						var wallTopNode = scene.addNode(lightNode, wallTop, "wallTopNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(wallTopNode.transform, [0,5.5,0]);
						Mat4x4.makeScaling(scalingMatrix, [16 + 1,1,1]);
						Mat4x4.multiply( wallTopNode.transform, wallTopNode.transform, scalingMatrix);
				}
				{ // ADD PLATFORM
						var platformNode = scene.addNode(lightNode, platform, "platformNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(platformNode.transform, [0,-4.5,0]);
						Mat4x4.makeScaling(scalingMatrix, [4,0.5,1]);
						Mat4x4.multiply( platformNode.transform,  platformNode.transform, scalingMatrix);
				}
				{ // ADD BALL
					 var ballNode = scene.addNode(lightNode, ball, "ballNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(ballNode.transform, [0,-3.75,0]);
						Mat4x4.makeScaling(scalingMatrix, [0.5,0.5,0.5]);
						Mat4x4.multiply( ballNode.transform, ballNode.transform, scalingMatrix);
				}
				{ // ADD BRICKS
						var brickNodes = []
						for(var r = 0; r < brickRows; ++r){
								brickNodes.push([]);
								for(var c = 0; c < brickColumns; ++c){
									 var brickNode = scene.addNode(lightNode, bricks[r][c], "brickNode".concat(r, c), Node.NODE_TYPE.MODEL);
										Mat4x4.makeTranslation(brickNode.transform, [-brickColumns/2 + c + 0.5,4.5 - r,0]);
										Mat4x4.makeScaling(scalingMatrix, [0.9,0.9,0.9]);
										Mat4x4.multiply( brickNode.transform, brickNode.transform, scalingMatrix);
								}
								brickNodes[r].push(brickNode);
						}
				}
		}
  //var wallRightNode = scene.addNode(scene.root, wallRight, "wallRightNode", Node.NODE_TYPE.MODEL);
  //var wallTopNode = scene.addNode(scene.root, wallTop, "wallTopNode", Node.NODE_TYPE.MODEL);
  //var sphereNode = scene.addNode(lightNode, model, "sphereNode", Node.NODE_TYPE.MODEL);
  //var sphereNode2 = scene.addNode(sphereNode, model2, "sphereNode2", Node.NODE_TYPE.MODEL);
  //var quadNode = scene.addNode(scene.root, model3, "quadNode", Node.NODE_TYPE.MODEL);

  //--------------------------------------------------------------------------------------------------------//
  // Set up animation
  //--------------------------------------------------------------------------------------------------------//
  var ang = 0;

  /*sphereNode2.animationCallback = function(deltaTime) {
    ang += deltaTime / 1000;
    this.transform[13] = Math.cos(ang) * 3;
  };*/

  // quadNode.animationCallback = function(deltaTime) {
  //   ang += deltaTime / 1000;
  //   this.transform[13] = Math.cos(ang) * 3;
  // };

  var theta = 0;
  var lightTransform = Mat4x4.create();
  var modelTransform = Mat4x4.create(); 
  var viewTransform = Mat4x4.create(); 
  var observer = Vec3.from(0,0,25);

  Mat4x4.makeIdentity(viewTransform);
  Mat4x4.makeIdentity(modelTransform);
  Mat4x4.makeIdentity(lightTransform);

  //--------------------------------------------------------------------------------------------------------//
  // Set up render loop
  //--------------------------------------------------------------------------------------------------------//

  scene.setViewFrustum(1, 100, 0.5236);

  var animate=function() 
  {
    theta += 0.01; // Increment rotation angle

    //Mat4x4.makeTranslation(sphereNode2.transform, [10,0,0]);

    Mat4x4.makeRotationY(viewTransform, theta);  // rotate camera about y
    //Mat4x4.multiplyPoint(observer, viewTransform, [0,0,15]);  // apply camera rotation   
    scene.lookAt(observer, [0,0,0], [0,1,0]);

    scene.beginFrame();
    scene.animate();
    scene.draw();
    scene.endFrame();

    window.requestAnimationFrame(animate);
  };

  // Go!
  animate();
};
