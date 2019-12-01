//--------------------------------------------------------------------------------------------------------//
// Program main entry point
//--------------------------------------------------------------------------------------------------------//
var main=function() 
{
		{ // HELPER VARIABLES
				var Vec3 = matrixHelper.vector3;
				var Mat4x4 = matrixHelper.matrix4;
				var pi = 3.14159265359;
		}

		{ // INITIALISE CONTEXT (CANVAS, GL)
				{ // GET REFERENCE TO CANVAS
						var canvas = document.getElementById("canvas-cg-lab");
						canvas.width = window.innerWidth;
						canvas.height = window.innerHeight;
						canvas.aspect = canvas.width / canvas.height;
				}
				{ // ASSIGN CONTEXT TO GL
						var gl = null;
						try { gl = canvas.getContext("experimental-webgl", {antialias: true}); }
						catch (e) {alert("No webGL compatibility detected!"); return false;}
				}
		}

		{ // SET UP GAME
				var game = new Game();
				document.addEventListener( 'keydown', function(e){ game.onKeyDown(e); } );
				document.addEventListener( 'keyup', function(e){ game.onKeyUp(e); } );
		}

		{ // SET UP SCENE
				scene = new Scene();
				scene.initialise(gl, canvas);
		}

		{ // SET UP GEOMETRY PRIMITIVES
				var sphere = makeSphere([0,0,0], 1, 50, 50, [0,0,0]);
				var quad = makeCuboid([0,0,0], 1, 1, 1);
		}

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
						for(var r = 0; r < game.brickRows; ++r){
								bricks.push([]);
								for(var c = 0; c < game.brickColumns; ++c){
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

		{// SET UP PHYSICS ITEMS
				for(var r = 0; r < game.brickRows; ++r){
						game.bricks.push([]);
						for(var c = 0; c < game.brickColumns; ++c){
								game.bricks[r].push( new RectObject() );
								game.bricks[r][c].position = [c * ((game.wallWidth-1)/(game.brickColumns)) - game.wallWidth/2 + 0.5 + ((game.wallWidth)/(game.brickColumns))/2,4.5 - r]
								game.bricks[r][c].width = ((game.wallWidth-1)/(game.brickColumns)) * 0.9;
								game.bricks[r][c].height = 0.9 * 3.0 / game.brickRows;
						}
				}

				game.ball.position = [0,-game.wallHeight/2 + 0.5 + game.ballScale];
				game.ball.radius = game.ballScale;

				game.platform.position = [0,-game.wallHeight/2 + 0.25];
				game.platform.width = game.platformScale;
				game.platform.height = 0.5;

				game.walls[0].position = [-game.wallWidth/2,0]
				game.walls[0].width = 1;
				game.walls[0].height = game.wallHeight;

				game.walls[1].position = [game.wallWidth/2,0]
				game.walls[1].width = 1
				game.walls[1].height = game.wallHeight;

				game.walls[2].position = [0,game.wallHeight/2+0.5]
				game.walls[2].width = game.wallWidth + 1;
				game.walls[2].height = 1;
		}

  //--------------------------------------------------------------------------------------------------------//
  // Set up lights
  //--------------------------------------------------------------------------------------------------------//
  //light.type = Light.LIGHT_TYPE.SPOT;
  //light.type = Light.LIGHT_TYPE.POINT;
  var light_directional = new Light();
  light_directional.type = Light.LIGHT_TYPE.DIRECTIONAL;
  light_directional.setDiffuse([2, 2, 2]);
  light_directional.setSpecular([1, 1, 1]);
  light_directional.setAmbient([0.1, 0.1, 0.1]);
  light_directional.setPosition([0, 0, 2.5]);
  light_directional.setDirection([0, 0, -1]);
  light_directional.setCone(0.7, 0.6);
  light_directional.attenuation = Light.ATTENUATION_TYPE.NONE;
  light_directional.bind(gl, scene.shaderProgram, 0);

		var light_point = new Light();
  light_point.type = Light.LIGHT_TYPE.POINT;
  light_point.setDiffuse([5, 5, 5]);
  light_point.setSpecular([1, 1, 1]);
  light_point.setAmbient([1, 1, 1]);
  light_point.setPosition([0, 0, 0]);
  light_point.attenuation = Light.ATTENUATION_TYPE.QUAD;
  light_point.bind(gl, scene.shaderProgram, 0);

  //--------------------------------------------------------------------------------------------------------//
  // Set up textures and materials
  //--------------------------------------------------------------------------------------------------------//
  var textureList = new Textures();
  convertTextures(textureList);

		{ // CREATE THE MATERIALS
				var material_shiny = new Material();
				var material_diffuse_brick = new Material();
				var material_diffuse_platform = new Material();
				var material_diffuse_wall = new Material();

				{ // BRICK
						material_diffuse_brick.setAlbedo(gl, textureList.wood);
						material_diffuse_brick.setShininess(10.0);
						material_diffuse_brick.setSpecular([0,0,0]);
						material_diffuse_brick.setAmbient([1,1,1]);
						material_diffuse_brick.setDiffuse([1,1,1]);
						material_diffuse_brick.bind(gl, scene.shaderProgram);
				}
				{ // PLATFORM
						material_diffuse_platform.setAlbedo(gl, textureList.wood2);
						material_diffuse_platform.setShininess(10.0);
						material_diffuse_platform.setSpecular([0,0,0]);
						material_diffuse_platform.setAmbient([1,1,1]);
						material_diffuse_platform.setDiffuse([1,1,1]);
						material_diffuse_platform.bind(gl, scene.shaderProgram);
				}
				{ // WALL
						material_diffuse_wall.setAlbedo(gl, textureList.wood3);
						material_diffuse_wall.setShininess(10.0);
						material_diffuse_wall.setSpecular([0,0,0]);
						material_diffuse_wall.setAmbient([1,1,1]);
						material_diffuse_wall.setDiffuse([1,1,1]);
						material_diffuse_wall.bind(gl, scene.shaderProgram);
				}
				{ // BALL
						material_shiny.setAlbedo(gl, textureList.iron);
						material_shiny.setShininess(300);
						material_shiny.setSpecular([1,1,1]);
						material_shiny.setAmbient([1,1,1]);
						material_shiny.setDiffuse([1,1,1]);
						material_shiny.bind(gl, scene.shaderProgram);
				}
		}

		{ // GIVE MATERIALS TO OBJECTS
				wallLeft.material = wallRight.material = wallTop.material = material_diffuse_wall;

				platform.material = material_diffuse_platform;

				ball.material = material_shiny;

				for(var r = 0; r < game.brickRows; ++r){
						for(var c = 0; c < game.brickColumns; ++c){
								bricks[r][c].material = material_diffuse_brick;
						}
				}
		}

		{ // SET UP SCENE GRAPH
				var scalingMatrix = Mat4x4.create(); // matrix to set scale of items

				//var lightNode_point = scene.addNode(scene.root, light_point, "lightNode_directional", Node.NODE_TYPE.LIGHT);
				var lightNode_directional = scene.addNode(scene.root, light_directional, "lightNode_directional", Node.NODE_TYPE.LIGHT);
				{ // ADD WALLS
						var wallLeftNode = scene.addNode(lightNode_directional, wallLeft, "wallLeftNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(wallLeftNode.transform, [-game.wallWidth/2,0,0]);
						Mat4x4.makeScaling(scalingMatrix, [1,game.wallHeight,1]);
						Mat4x4.multiply( wallLeftNode.transform, wallLeftNode.transform, scalingMatrix);

						var wallRightNode = scene.addNode(lightNode_directional, wallRight, "wallRightNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(wallRightNode.transform, [game.wallWidth/2,0,0]);
						Mat4x4.makeScaling(scalingMatrix, [1,game.wallHeight,1]);
						Mat4x4.multiply( wallRightNode.transform, wallRightNode.transform, scalingMatrix);

						var wallTopNode = scene.addNode(lightNode_directional, wallTop, "wallTopNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(wallTopNode.transform, [0,game.wallHeight/2+0.5,0]);
						Mat4x4.makeScaling(scalingMatrix, [game.wallWidth + 1,1,1]);
						Mat4x4.multiply( wallTopNode.transform, wallTopNode.transform, scalingMatrix);
				}
				{ // ADD PLATFORM
						var platformNode = scene.addNode(lightNode_directional, platform, "platformNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(platformNode.transform, [0,-game.wallHeight/2 + 0.25,0]);
						Mat4x4.makeScaling(scalingMatrix, [game.platformScale,0.5,1]);
						Mat4x4.multiply( platformNode.transform,  platformNode.transform, scalingMatrix);
				}
				{ // ADD BRICKS
						var brickNodes = []
						for(var r = 0; r < game.brickRows; ++r){
								brickNodes.push([]);
								for(var c = 0; c < game.brickColumns; ++c){
									 var brickNode = scene.addNode(lightNode_directional, bricks[r][c], "brickNode".concat(r, c), Node.NODE_TYPE.MODEL);
										Mat4x4.makeTranslation(brickNode.transform, [ c * ((game.wallWidth-1)/(game.brickColumns)) - game.wallWidth/2 + 0.5 + ((game.wallWidth)/(game.brickColumns))/2,4.5 - r,0]);
										Mat4x4.makeScaling(scalingMatrix, [((game.wallWidth-1)/(game.brickColumns)) * 0.9, 0.9 * 3.0 / game.brickRows, 1]);
										Mat4x4.multiply( brickNode.transform, brickNode.transform, scalingMatrix);
								}
								brickNodes[r].push(brickNode);
						}
				}
				{ // ADD BALL
					 var ballNode = scene.addNode(lightNode_directional, ball, "ballNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(ballNode.transform, [game.ball.position[0],game.ball.position[1],0]);
						Mat4x4.makeScalingUniform(scalingMatrix, game.ballScale);
						Mat4x4.multiply( ballNode.transform, ballNode.transform, scalingMatrix);
				}
		}

  { // Set up animation
				/*lightNode_point.animationCallback = function(deltaTime){
						lightNode_point.nodeObject.position = [5,0,0];
				}*/
		}

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
				{ // GAME UPDATE
						{ // PLATFORM MOVEMENT
								if(game.keysDown[37]){
										if(game.platform.position[0] - (game.platform.width*game.platformWidthMultiplier)/2 > - (game.wallWidth/2 - 0.6)){
												game.platform.position[0] -= game.platformSpeed;
												if(game.ballIsStuck) {
														game.ball.position[0] -= game.platformSpeed;
												}
										}
								}
								if(game.keysDown[39]){
										if(game.platform.position[0] + (game.platform.width*game.platformWidthMultiplier)/2 < (game.wallWidth/2 - 0.6)){
												game.platform.position[0] += game.platformSpeed;
												if(game.ballIsStuck) {
														game.ball.position[0] += game.platformSpeed;
												}
										}
								}
						}
						{ // LAUNCHING BALL
								if(game.keysDown[32]){
										game.ballLaunchVelocity += game.ballAccellerationPerFrame;
								}
						}

						move(game.ball);
						
						{ // COLLISION WITH PLATFORM
								if(CollisionRectCirc(game.platform, game.ball) == COLLISION_TYPE.TOP || CollisionRectCirc(game.platform, game.ball) == COLLISION_TYPE.TOP_LEFT || CollisionRectCirc(game.platform, game.ball) == COLLISION_TYPE.TOP_RIGHT){
										game.ball.velocity = [game.ball.velocity[0], -game.ball.velocity[1]]; // TODO: CHANGE THIS
										changeVelocityFromPoint(game.ball.velocity, [game.platform.position[0], game.platform.position[1] - 2], game.ball.position, game.ballVelocity);
								}
						}

						{ // COLLISION WITH BRICKS
								for(var r = 0; r < game.brickRows; ++r){
										for(var c = 0; c < game.brickColumns; ++c){
												if(game.bricks[r][c] !== null){
														var collided = false;
														if(CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.BOTTOM || CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.TOP){
																game.ball.velocity = [game.ball.velocity[0], -game.ball.velocity[1]];
																collided = true;
														} else if(CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.LEFT || CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.RIGHT){
																game.ball.velocity = [-game.ball.velocity[0], game.ball.velocity[1]];
																collided = true;
														} else if(CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.TOP_LEFT || CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.TOP_RIGHT | CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.BOTTOM_RIGHT || CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.BOTTOM_LEFT){
																game.ball.velocity = [game.ball.velocity[0], -game.ball.velocity[1]];
																collided = true;
														}
														
														if(collided){
																scene.removeNode("brickNode".concat(r,c));
																game.bricks[r][c] = null;
														}
												}
										}
								}
						}

						{ // COLLISION WITH WALLS
								for(var i = 0; i < game.walls.length; ++i){
										if(CollisionRectCirc(game.walls[i], game.ball) == COLLISION_TYPE.BOTTOM || CollisionRectCirc(game.walls[i], game.ball) == COLLISION_TYPE.TOP){
												game.ball.velocity = [game.ball.velocity[0], -game.ball.velocity[1]];
										} else if(CollisionRectCirc(game.walls[i], game.ball) == COLLISION_TYPE.LEFT || CollisionRectCirc(game.walls[i], game.ball) == COLLISION_TYPE.RIGHT){
												game.ball.velocity = [-game.ball.velocity[0], game.ball.velocity[1]];
										}
								}
						}

				}

				{ // PLATFORM MOVEMENT
						Mat4x4.makeTranslation(platformNode.transform, [game.platform.position[0],-game.wallHeight/2 + 0.25,0]);
						Mat4x4.makeScaling(scalingMatrix, [game.platformScale,0.5,1]);
						Mat4x4.multiply( platformNode.transform,  platformNode.transform, scalingMatrix);
				}
				{// BALL MOVEMENT
						Mat4x4.makeTranslation(ballNode.transform, [game.ball.position[0],game.ball.position[1],0]);
						Mat4x4.makeScalingUniform(scalingMatrix, game.ballScale);
						Mat4x4.multiply( ballNode.transform, ballNode.transform, scalingMatrix);
				}

				{ // CAMERA MOVEMENT
						if(game.keysDown[81]){       // pressing Q
								game.cameraAngle = -game.cameraGrazingAngle; // grazing
						}else if(game.keysDown[69]){ // pressing E
								game.cameraAngle = 0;  // top view
						}else if(game.keysDown[87]){ // Pressing W
								game.cameraAngle += game.cameraSpeed;
								if(game.cameraAngle > game.cameraGrazingAngle){
										game.cameraAngle = game.cameraGrazingAngle;
								}
						}
						else if(game.keysDown[83]){ // Pressing S
								game.cameraAngle -= game.cameraSpeed;
								if(game.cameraAngle < 0){
										game.cameraAngle = 0;
								}
						}
						else if(game.keysDown[82]){ // Pressing R
								game.cameraSpeed += game.cameraAcceleration;
								if(game.cameraSpeed > game.maxCameraSpeed){
										game.cameraSpeed = game.maxCameraSpeed;
								}
						}
						else if(game.keysDown[84]){ // Pressing T
								game.cameraSpeed -= game.cameraAcceleration;
								if(game.cameraSpeed < game.minCameraSpeed){
										game.cameraSpeed = game.minCameraSpeed;
								}
						}
				}

    //Mat4x4.makeTranslation(sphereNode2.transform, [10,0,0]);
				Mat4x4.makeRotationX(viewTransform, game.cameraAngle);
    Mat4x4.multiplyPoint(observer, viewTransform, [0,0,25]);  // apply camera rotation   
    scene.lookAt(observer, [0,0,0], [0,10,0]);

    scene.beginFrame();
    scene.animate();
    scene.draw();
    scene.endFrame();

    window.requestAnimationFrame(animate);
  };

  // Go!
  animate();
};
