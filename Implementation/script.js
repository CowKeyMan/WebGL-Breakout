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
						var wall = new Model();
						wall.name = "wall";
						wall.index = quad.index;
						wall.vertex = quad.vertex;
						wall.compile(scene);
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
						var brick = new Model();
						brick.name = "brick";
						brick.index = quad.index;
						brick.vertex = quad.vertex;
						brick.compile(scene);
				}
				{ // ADD POWERUPS
						var powerup = new Model();
						powerup.name = "powerup";
						powerup.index = sphere.index;
						powerup.vertex = sphere.vertex;
						powerup.compile(scene);
				}
				{ // ADD BULLETS
						var bullet = new Model();
						bullet.name = "bullet";
						bullet.index = sphere.index;
						bullet.vertex = sphere.vertex;
						bullet.compile(scene);
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

				for(var i = 0; i < game.powerupPoolAmount; ++i){
						game.powerups.push(new CircObject());
						game.powerups[i].position = [100 + i * 50, 100];
						game.powerups[i].radius = 0.3;
				}

				for(var i = 0; i < game.bulletPoolAmount; ++i){
						game.bullets.push(new CircObject());
						game.bullets[i].position = [100, 100];
						game.bullets[i].radius = 0.1;
				}

				for(var i = 0; i < game.additionalBallsPoolAmount; ++i){
						game.additionalBalls.push(new CircObject());
						game.additionalBalls[i].position = [100, 100];
						game.additionalBalls[i].radius = game.ballScale;
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
  { // Set up lights
				var light_directional = new Light();
				light_directional.type = Light.LIGHT_TYPE.DIRECTIONAL;
				light_directional.setDiffuse([2, 2, 2]);
				light_directional.setSpecular([5, 5, 5]);
				light_directional.setAmbient([0.1, 0.1, 0.1]);
				light_directional.setDirection([0, 0, -1]);
				light_directional.bind(gl, scene.shaderProgram, 0);

				var light_point = new Light();
				light_point.type = Light.LIGHT_TYPE.POINT;
				light_point.setDiffuse([5, 5, 5]);
				light_directional.setSpecular([8, 8, 8]);
				light_point.setAmbient([.3, .3, .3]);
				light_point.attenuation = Light.ATTENUATION_TYPE.QUAD;
				light_point.bind(gl, scene.shaderProgram, 1);

				var light_spot_left = new Light();
				light_spot_left.type = Light.LIGHT_TYPE.SPOT;
				light_spot_left.setDiffuse([7, 7, 7]);
				light_spot_left.setSpecular([8, 8, 8]);
				light_spot_left.setAmbient([0.5, 0.5, 0.5]);
				light_spot_left.setDirection([0, 1, 0]);
				light_spot_left.setCone(1, 0.99);
				light_spot_left.attenuation = Light.ATTENUATION_TYPE.NONE;
				light_spot_left.bind(gl, scene.shaderProgram, 2);

				var light_spot_right = new Light();
				light_spot_right.type = Light.LIGHT_TYPE.SPOT;
				light_spot_right.setDiffuse([7, 7, 7]);
				light_spot_right.setSpecular([1, 1, 1]);
				light_spot_right.setAmbient([0.5, 0.5, 0.5]);
				light_spot_right.setDirection([0, 1, 0]);
				light_spot_right.setCone(1, 0.99);
				light_spot_right.attenuation = Light.ATTENUATION_TYPE.NONE;
				light_spot_right.bind(gl, scene.shaderProgram, 3);
		}

  //--------------------------------------------------------------------------------------------------------//
  // Set up textures and materials
  //--------------------------------------------------------------------------------------------------------//
  var textureList = new Textures();
  convertTextures(textureList);

		{ // CREATE THE MATERIALS
				{ // BRICK
						var material_diffuse_brick = new Material();
						material_diffuse_brick.setAlbedo(gl, textureList.wood);
						material_diffuse_brick.setShininess(10.0);
						material_diffuse_brick.setSpecular([0,0,0]);
						material_diffuse_brick.setAmbient([1,1,1]);
						material_diffuse_brick.setDiffuse([1,1,1]);
						material_diffuse_brick.bind(gl, scene.shaderProgram);
				}
				{ // PLATFORM
						var material_diffuse_platform = new Material();
						material_diffuse_platform.setAlbedo(gl, textureList.wood2);
						material_diffuse_platform.setShininess(10.0);
						material_diffuse_platform.setSpecular([0,0,0]);
						material_diffuse_platform.setAmbient([1,1,1]);
						material_diffuse_platform.setDiffuse([1,1,1]);
						material_diffuse_platform.bind(gl, scene.shaderProgram);
				}
				{ // WALL
						var material_diffuse_wall = new Material();
						material_diffuse_wall.setAlbedo(gl, textureList.wood3);
						material_diffuse_wall.setShininess(10.0);
						material_diffuse_wall.setSpecular([0,0,0]);
						material_diffuse_wall.setAmbient([1,1,1]);
						material_diffuse_wall.setDiffuse([1,1,1]);
						material_diffuse_wall.bind(gl, scene.shaderProgram);
				}
				{ // BALL
						var material_shiny = new Material();
						material_shiny.setAlbedo(gl, textureList.iron);
						material_shiny.setShininess(300);
						material_shiny.setSpecular([1,1,1]);
						material_shiny.setAmbient([1,1,1]);
						material_shiny.setDiffuse([1,1,1]);
						material_shiny.bind(gl, scene.shaderProgram);
				}
				{ // POWERUPS
						var material_gold = new Material();
						material_gold.setAlbedo(gl, textureList.gold);
						material_gold.setShininess(300);
						material_gold.setSpecular([1,1,1]);
						material_gold.setAmbient([1,1,1]);
						material_gold.setDiffuse([1,1,1]);
						material_gold.bind(gl, scene.shaderProgram);
				}
				{ // BULLETS
						var material_oil = new Material();
						material_oil.setAlbedo(gl, textureList.oil);
						material_oil.setShininess(300);
						material_oil.setSpecular([1,1,1]);
						material_oil.setAmbient([1,1,1]);
						material_oil.setDiffuse([1,1,1]);
						material_oil.bind(gl, scene.shaderProgram);
				}
		}

		{ // GIVE MATERIALS TO OBJECTS
				wall.material = material_diffuse_wall;

				platform.material = material_diffuse_platform;

				ball.material = material_shiny;

				brick.material = material_diffuse_brick;

				powerup.material = material_gold;

				bullet.material = material_oil;
		}

		{ // SET UP SCENE GRAPH
				var scalingMatrix = Mat4x4.create(); // matrix to set scale of items

				var lightNode_point = scene.addNode(scene.root, light_point, "lightNode_point", Node.NODE_TYPE.LIGHT);
				var lightNode_spot_left = scene.addNode(lightNode_point, light_spot_left, "lightNode_spot_left", Node.NODE_TYPE.LIGHT);
				var lightNode_spot_right = scene.addNode(lightNode_spot_left, light_spot_right, "lightNode_directional", Node.NODE_TYPE.LIGHT);
				var lightNode_directional = scene.addNode(lightNode_spot_right, light_directional, "lightNode_directional", Node.NODE_TYPE.LIGHT);
				{ // ADD WALLS
						var wallLeftNode = scene.addNode(lightNode_directional, wall, "wallLeftNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(wallLeftNode.transform, [-game.wallWidth/2,0,0]);
						Mat4x4.makeScaling(scalingMatrix, [1,game.wallHeight,1]);
						Mat4x4.multiply( wallLeftNode.transform, wallLeftNode.transform, scalingMatrix);

						var wallRightNode = scene.addNode(lightNode_directional, wall, "wallRightNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeTranslation(wallRightNode.transform, [game.wallWidth/2,0,0]);
						Mat4x4.makeScaling(scalingMatrix, [1,game.wallHeight,1]);
						Mat4x4.multiply( wallRightNode.transform, wallRightNode.transform, scalingMatrix);

						var wallTopNode = scene.addNode(lightNode_directional, wall, "wallTopNode", Node.NODE_TYPE.MODEL);
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
						var brickNodes = [];
						for(var r = 0; r < game.brickRows; ++r){
								brickNodes.push([]);
								for(var c = 0; c < game.brickColumns; ++c){
									 var brickNode = scene.addNode(lightNode_directional, brick, "brickNode".concat(r, c), Node.NODE_TYPE.MODEL);
										Mat4x4.makeTranslation(brickNode.transform, [ c * ((game.wallWidth-1)/(game.brickColumns)) - game.wallWidth/2 + 0.5 + ((game.wallWidth)/(game.brickColumns))/2,4.5 - r,0]);
										Mat4x4.makeScaling(scalingMatrix, [((game.wallWidth-1)/(game.brickColumns)) * 0.9, 0.9 * 3.0 / game.brickRows, 1]);
										Mat4x4.multiply( brickNode.transform, brickNode.transform, scalingMatrix);
								}
								brickNodes[r].push(brickNode);
						}
				}
				{ // ADD BALL
					 var ballNode = scene.addNode(lightNode_directional, ball, "ballNode", Node.NODE_TYPE.MODEL);
						Mat4x4.makeScalingUniform(scalingMatrix, game.ballScale);
						Mat4x4.multiply( ballNode.transform, ballNode.transform, scalingMatrix);
				}
				{ // ADD POWERUPS
				  var powerupNodes = [];
					 for(var i = 0; i < game.powerups.length; ++i){
								var powerupNode = scene.addNode(lightNode_directional, powerup, "powerupNode".concat(i), Node.NODE_TYPE.MODEL);
								Mat4x4.makeScalingUniform(scalingMatrix, game.powerups[i].radius);
								Mat4x4.multiply( powerupNode.transform, powerupNode.transform, scalingMatrix);
								powerupNodes.push(powerupNode);
						}
				}
				{ // ADD BULLETS
				  var bulletNodes = [];
					 for(var i = 0; i < game.bullets.length; ++i){
								var bulletNode = scene.addNode(lightNode_directional, bullet, "bulletNode".concat(i), Node.NODE_TYPE.MODEL);
								Mat4x4.makeScalingUniform(scalingMatrix, game.bullets[i].radius);
								Mat4x4.multiply( bulletNode.transform, bulletNode.transform, scalingMatrix);
								bulletNodes.push(bulletNode);
						}
				}
				{ // ADD ADDITIONAL BALLS
						var additionalBallsNodes = [];
					 for(var i = 0; i < game.additionalBalls.length; ++i){
								var additionalBall = scene.addNode(lightNode_directional, ball, "additionalBall".concat(i), Node.NODE_TYPE.MODEL);
								Mat4x4.makeTranslation(additionalBall.transform, [game.additionalBalls[i].position[0], game.additionalBalls[i].position[1], 0]);
								Mat4x4.makeScalingUniform(scalingMatrix, game.ballScale);
								Mat4x4.multiply( additionalBall.transform, additionalBall.transform, scalingMatrix);
								additionalBallsNodes.push(additionalBall);
						}
				}
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
								if(game.keysDown[37]){ // LEFT ARROW
										if(game.platform.position[0] - (game.platform.width)/2 > - (game.wallWidth/2 - 0.6)){
												game.platform.position[0] -= game.platformSpeed;
												if(game.ballIsStuck) {
														game.ball.position[0] -= game.platformSpeed;
												}
										}
								}
								if(game.keysDown[39]){ // RIGHT ARROW
										if(game.platform.position[0] + (game.platform.width)/2 < (game.wallWidth/2 - 0.6)){
												game.platform.position[0] += game.platformSpeed;
												if(game.ballIsStuck) {
														game.ball.position[0] += game.platformSpeed;
												}
										}
								}
						}
						{ // LAUNCHING BALL
								if(game.keysDown[32]){ // SPACEBAR
										game.ballLaunchVelocity += game.ballAccellerationPerFrame;
								}
						}

						{ // MOVEMENT
								// to avoid having ball get stuck
								if(Math.abs(game.ball.velocity[1]) < 0.01 && !game.ballIsStuck && game.score < game.brickRows * game.brickColumns){
										game.ball.velocity[0] -= 0.01;
										game.ball.velocity[1] -= 0.01;
								}
								moveMultiply(game.ball, (Date.now() > game.halfSpeedStartTime + game.halfSpeedAmount)? 1: 0.5);
								for(var i = 0; i < game.powerups.length; ++i){
										move(game.powerups[i]);
								}
								for(var i = 0; i < game.bullets.length; ++i){
										move(game.bullets[i]);
								}
								for(var i = 0; i < game.additionalBalls.length; ++i){
										move(game.additionalBalls[i]);
								}
						}

						{ // POWERUP UPDATE
								if(Date.now() > game.widePlatformStartTime + game.widePlatformAmount){
										game.platform.width = game.platformScale;
								}else{
										game.platform.width = game.platformScale * game.platformWidthMultiplier;
								}
						}

					 { //	BALL COLLISION
								{ // COLLISION WITH PLATFORM
										if(CollisionRectCirc(game.platform, game.ball) == COLLISION_TYPE.TOP || CollisionRectCirc(game.platform, game.ball) == COLLISION_TYPE.TOP_LEFT || CollisionRectCirc(game.platform, game.ball) == COLLISION_TYPE.TOP_RIGHT){
												if(game.stuckAmount > 0){
														game.ballIsStuck = true;
														game.ball.velocity = [0,0];
														game.stuckAmount -=1;
														game.ball.position[1] = -game.wallHeight/2 + 0.5 + game.ballScale; 
												}else{
														changeVelocityFromPoint(game.ball.velocity, [game.platform.position[0], game.platform.position[1] - 2], game.ball.position, game.ballVelocity);
												}
												document.getElementById("PlatformHit").play();
										}
								}
								{ // COLLISION WITH BRICKS
										for(var r = 0; r < game.brickRows; ++r){
												for(var c = 0; c < game.brickColumns; ++c){
														if(game.bricks[r][c] !== null){
																var collided = false;
																if(CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.BOTTOM || CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.TOP){
																		if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.ball.velocity = [game.ball.velocity[0], -game.ball.velocity[1]];
																		collided = true;
																} else if(CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.LEFT || CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.RIGHT){
																		if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.ball.velocity = [-game.ball.velocity[0], game.ball.velocity[1]];
																		collided = true;
																} else if(CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.TOP_LEFT){
																		if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.ball.velocity = [-Math.abs(game.ball.velocity[0]), Math.abs(game.ball.velocity[1])];
																		collided = true;
																} else if(CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.TOP_RIGHT){
																		if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.ball.velocity = [Math.abs(game.ball.velocity[0]), Math.abs(game.ball.velocity[1])];
																		collided = true;
																} else if(CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.BOTTOM_LEFT){ 
																		if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.ball.velocity = [-Math.abs(game.ball.velocity[0]), -Math.abs(game.ball.velocity[1])];
																		collided = true;
																} else if(CollisionRectCirc(game.bricks[r][c], game.ball) == COLLISION_TYPE.BOTTOM_RIGHT){
																		if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.ball.velocity = [Math.abs(game.ball.velocity[0]), -Math.abs(game.ball.velocity[1])];
																		collided = true;
																}
																
																if(collided){
																		var brickPosition = game.bricks[r][c].position;
																		scene.removeNode("brickNode".concat(r,c));
																		game.bricks[r][c] = null;
																		game.points += 1;
																		document.getElementById("BrickHit").play();
																		if(game.points >= game.brickRows * game.brickColumns){
																				document.getElementById("theme").pause();
																				document.getElementById("theme").currentTime = 0;
																				document.getElementById("VictoryFanfare").play();
																				game.ball.velocity = [0,0];
																				setTimeout("location.href = 'index.html'",5 * 1000);
																		}else{
																				if(Math.random() > 0.0){
																						var pow = game.powerupPool.getNext();
																						pow.position = brickPosition;
																						pow.velocity = [0, game.powerupVelocity];
																				}
																		}
																}
														}
												}
										}
								}
								{ // COLLISION WITH WALLS
										for(var i = 0; i < game.walls.length; ++i){
												if(CollisionRectCirc(game.walls[i], game.ball) == COLLISION_TYPE.BOTTOM || CollisionRectCirc(game.walls[i], game.ball) == COLLISION_TYPE.TOP){
														game.ball.velocity = [game.ball.velocity[0], -game.ball.velocity[1]];
														document.getElementById("WallHit").currentTime = 0;
														document.getElementById("WallHit").play();
												} else if(CollisionRectCirc(game.walls[i], game.ball) == COLLISION_TYPE.LEFT){
														game.ball.velocity = [-Math.abs(game.ball.velocity[0]), game.ball.velocity[1]];
														document.getElementById("WallHit").currentTime = 0;
														document.getElementById("WallHit").play();
												}else if(CollisionRectCirc(game.walls[i], game.ball) == COLLISION_TYPE.RIGHT){
														game.ball.velocity = [Math.abs(game.ball.velocity[0]), game.ball.velocity[1]];
														document.getElementById("WallHit").currentTime = 0;
														document.getElementById("WallHit").play();
												}
										}
								}
								{// BALL FALLS IN PIT
										if(game.ball.position[1] < game.deathLevel){
												game.lives -= 1;
												if(game.lives <= 0){
														document.getElementById("theme").pause();
														document.getElementById("theme").currentTime = 0;
														document.getElementById("Lose").play();
														setTimeout("location.href = 'index.html'",3 * 1000);
														game.ball.position = [100,100]
														for(var i = 0; i < game.additionalBalls.length; ++i){
																game.additionalBalls[i].velocity = [0,0];
														}
												}else{
														game.ball.position = [game.platform.position[0] ,-game.wallHeight/2 + 0.5 + game.ballScale];
														game.ball.velocity = [0,0];
														game.ballIsStuck = true;
														document.getElementById("ErrorBleep").play();
												}
										}
								}
				  }

						{ // POWERUPS COLLISION WITH PLATFORM
								for(var i = 0; i < game.powerups.length; ++i){
										if(CollisionRectCirc(game.platform, game.powerups[i]) != COLLISION_TYPE.NONE){
												game.powerups[i].position = [100,100];
												game.powerups[i].velocity = [0,0];
												document.getElementById("ItemCollect").play();

												r = Math.floor(Math.random() * 6);
												{ // APPLY POWERUP
														switch(r){
																case 0:
																		game.troughBricksStartTime = Date.now();
																break;
																case 1:
																		game.widePlatformStartTime = Date.now();
																break;
																case 2:
																		game.halfSpeedStartTime = Date.now();
																break;
																case 3:
																		game.stuckAmount = game.maxStuckAmount;
																break;
																case 4:
																		game.bulletAmount = game.maxBulletAmount;
																break;
																case 5:
																		var aBall = game.additionalBallPool.getNext();
																		
																		aBall.position[1] = game.ball.position[1];
																		if(game.ball.position[0] > 0){
																				aBall.position[0] = game.ball.position[0] - 0.1 - 2*game.ball.radius;
																		}else{
																				aBall.position[0] = game.ball.position[0] + 0.1 + 2*game.ball.radius;
																		}
																		if(game.ball.velocity[0] == 0 && game.ball.velocity[1] == 0){
																				aBall.velocity = [0, game.ballVelocity]
																		} else {
																				aBall.velocity = [game.ball.velocity[0], game.ball.velocity[1]]
																		}
																break;
														}
												}
										}
								}
						}

						{ // BULLETS COLLISION WITH BRICKS
								for(var i = 0; i < game.bullets.length; ++i){
										for(var r = 0; r < game.brickRows; ++r){
												for(var c = 0; c < game.brickColumns; ++c){
														if(game.bricks[r][c] != null && CollisionRectCirc(game.bricks[r][c], game.bullets[i]) != COLLISION_TYPE.NONE){
																game.bullets[i].velocity = [0,0];
																game.bullets[i].position = [100,100];

																var brickPosition = game.bricks[r][c].position;
																scene.removeNode("brickNode".concat(r,c));
																game.bricks[r][c] = null;
																game.points += 1;
																document.getElementById("BrickHit").currentTime = 0;
																document.getElementById("BrickHit").play();
																if(game.points >= game.brickRows * game.brickColumns){
																		document.getElementById("theme").pause();
																		document.getElementById("theme").currentTime = 0;
																		document.getElementById("VictoryFanfare").play();
																		game.ball.velocity = [0,0];
																		setTimeout("location.href = 'index.html'",5 * 1000);
																}else{
																		if(Math.random() > 0.0){
																				var pow = game.powerupPool.getNext();
																				pow.position = brickPosition;
																				pow.velocity = [0, game.powerupVelocity];
																		}
																}
														}
												}
										}
								}
						}

						{ //	ADDITIONAL BALLS COLLISION
								{ // COLLISION WITH PLATFORM
										for(var i = 0; i < game.additionalBalls.length; ++i){
												if(CollisionRectCirc(game.platform, game.additionalBalls[i]) == COLLISION_TYPE.TOP || CollisionRectCirc(game.platform, game.additionalBalls[i]) == COLLISION_TYPE.TOP_LEFT || CollisionRectCirc(game.platform, game.additionalBalls[i]) == COLLISION_TYPE.TOP_RIGHT){
														changeVelocityFromPoint(game.additionalBalls[i].velocity, [game.platform.position[0], game.platform.position[1] - 2], game.additionalBalls[i].position, game.ballVelocity);
														document.getElementById("PlatformHit").play();
												}
										}
								}
								{ // COLLISION WITH BRICKS
										for(var i = 0; i < game.additionalBalls.length; ++i){
												for(var r = 0; r < game.brickRows; ++r){
														for(var c = 0; c < game.brickColumns; ++c){
																if(game.bricks[r][c] !== null){
																		var collided = false;
																		if(CollisionRectCirc(game.bricks[r][c], game.additionalBalls[i]) == COLLISION_TYPE.BOTTOM || CollisionRectCirc(game.bricks[r][c], game.additionalBalls[i]) == COLLISION_TYPE.TOP){
																				if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.additionalBalls[i].velocity = [game.additionalBalls[i].velocity[0], -game.additionalBalls[i].velocity[1]];
																				collided = true;
																		} else if(CollisionRectCirc(game.bricks[r][c], game.additionalBalls[i]) == COLLISION_TYPE.LEFT || CollisionRectCirc(game.bricks[r][c], game.additionalBalls[i]) == COLLISION_TYPE.RIGHT){
																				if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.additionalBalls[i].velocity = [-game.additionalBalls[i].velocity[0], game.additionalBalls[i].velocity[1]];
																				collided = true;
																		} else if(CollisionRectCirc(game.bricks[r][c], game.additionalBalls[i]) == COLLISION_TYPE.TOP_LEFT){
																				if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.additionalBalls[i].velocity = [-Math.abs(game.additionalBalls[i].velocity[0]), Math.abs(game.additionalBalls[i].velocity[1])];
																				collided = true;
																		} else if(CollisionRectCirc(game.bricks[r][c], game.additionalBalls[i]) == COLLISION_TYPE.TOP_RIGHT){
																				if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.additionalBalls[i].velocity = [Math.abs(game.additionalBalls[i].velocity[0]), Math.abs(game.additionalBalls[i].velocity[1])];
																				collided = true;
																		} else if(CollisionRectCirc(game.bricks[r][c], game.additionalBalls[i]) == COLLISION_TYPE.BOTTOM_LEFT){ 
																				if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.additionalBalls[i].velocity = [-Math.abs(game.additionalBalls[i].velocity[0]), -Math.abs(game.additionalBalls[i].velocity[1])];
																				collided = true;
																		} else if(CollisionRectCirc(game.bricks[r][c], game.additionalBalls[i]) == COLLISION_TYPE.BOTTOM_RIGHT){
																				if(Date.now() > game.troughBricksStartTime + game.troughBricksAmount) game.additionalBalls[i].velocity = [Math.abs(game.additionalBalls[i].velocity[0]), -Math.abs(game.additionalBalls[i].velocity[1])];
																				collided = true;
																		}
																		
																		if(collided){
																				var brickPosition = game.bricks[r][c].position;
																				scene.removeNode("brickNode".concat(r,c));
																				game.bricks[r][c] = null;
																				game.points += 1;
																				document.getElementById("BrickHit").play();
																				if(game.points >= game.brickRows * game.brickColumns){
																						document.getElementById("theme").pause();
																						document.getElementById("theme").currentTime = 0;
																						document.getElementById("VictoryFanfare").play();
																						game.ball.velocity = [0,0];
																						for(var i = 0; i < game.additionalBalls.length; ++i){
																								game.additionalBalls[i].velocity = [0,0];
																						}
																						setTimeout("location.href = 'index.html'",5 * 1000);
																				}else{
																						if(Math.random() > 0.0){
																								var pow = game.powerupPool.getNext();
																								pow.position = brickPosition;
																								pow.velocity = [0, game.powerupVelocity];
																						}
																				}
																		}
																}
														}
												}
										}
								}
								{ // COLLISION WITH WALLS
										for(var i = 0; i < game.additionalBalls.length; ++i){
												for(var w = 0; w < game.walls.length; ++w){
														if(CollisionRectCirc(game.walls[w], game.additionalBalls[i]) == COLLISION_TYPE.BOTTOM || CollisionRectCirc(game.walls[w], game.additionalBalls[i]) == COLLISION_TYPE.TOP){
																game.additionalBalls[i].velocity = [game.additionalBalls[i].velocity[0], -game.additionalBalls[i].velocity[1]];
																document.getElementById("WallHit").currentTime = 0;
																document.getElementById("WallHit").play();
														} else if(CollisionRectCirc(game.walls[w], game.additionalBalls[i]) == COLLISION_TYPE.LEFT){
																game.additionalBalls[i].velocity = [-Math.abs(game.additionalBalls[i].velocity[0]), game.additionalBalls[i].velocity[1]];
																document.getElementById("WallHit").currentTime = 0;
																document.getElementById("WallHit").play();
														}else if(CollisionRectCirc(game.walls[w], game.additionalBalls[i]) == COLLISION_TYPE.RIGHT){
																game.additionalBalls[i].velocity = [Math.abs(game.additionalBalls[i].velocity[0]), game.additionalBalls[i].velocity[1]];
																document.getElementById("WallHit").currentTime = 0;
																document.getElementById("WallHit").play();
														}
												}
										}
								}
								{ // COLLISION WITH BALL AND OTHER ADDITIONAL BALLS
										for(var i = 0; i < game.additionalBalls.length; ++i){
												if(CollisionCircCirc(game.ball, game.additionalBalls[i])){
														changeVelocityFromPoint(game.additionalBalls[i].velocity, game.ball.position, game.additionalBalls[i].position, game.ballVelocity);
														if(game.ball.velocity[0] != 0 || game.ball.velocity[1] != 0){
																changeVelocityFromPoint(game.ball.velocity, game.additionalBalls[i].position, game.ball.position, game.ballVelocity);
														}
														document.getElementById("IronHit").currentTime = 0;
														document.getElementById("IronHit").play();
												}

												for(var j = 0; j < game.additionalBalls.length; ++j){
														if(j != i && CollisionCircCirc(game.additionalBalls[j], game.additionalBalls[i])){
																changeVelocityFromPoint(game.additionalBalls[i].velocity, game.additionalBalls[j].position, game.additionalBalls[i].position, game.ballVelocity);
																changeVelocityFromPoint(game.additionalBalls[j].velocity, game.additionalBalls[i].position, game.additionalBalls[j].position, game.ballVelocity);
																document.getElementById("IronHit").currentTime = 0;
																document.getElementById("IronHit").play();
														}
												}
										}
								}
				  }

				}

				{ // PLATFORM MOVEMENT
						Mat4x4.makeTranslation(platformNode.transform, [game.platform.position[0],-game.wallHeight/2 + 0.25,0]);
						Mat4x4.makeScaling(scalingMatrix, [game.platform.width,0.5,1]);
						Mat4x4.multiply( platformNode.transform,  platformNode.transform, scalingMatrix);
				}
				{ // BALL MOVEMENT
						Mat4x4.makeTranslation(ballNode.transform, [game.ball.position[0],game.ball.position[1],0]);
						Mat4x4.makeScalingUniform(scalingMatrix, game.ballScale);
						Mat4x4.multiply( ballNode.transform, ballNode.transform, scalingMatrix);
				}
				{ // POWERUP MOVEMENT
						for(var i = 0; i < game.powerups.length; ++i){
								Mat4x4.makeTranslation(powerupNodes[i].transform, [game.powerups[i].position[0], game.powerups[i].position[1], 0]);
								Mat4x4.makeScalingUniform(scalingMatrix, game.powerups[i].radius);
								Mat4x4.multiply( powerupNodes[i].transform, powerupNodes[i].transform, scalingMatrix);
						}
				}
				{ // BULLET MOVEMENT
						for(var i = 0; i < game.bullets.length; ++i){
								Mat4x4.makeTranslation(bulletNodes[i].transform, [game.bullets[i].position[0], game.bullets[i].position[1], 0]);
								Mat4x4.makeScalingUniform(scalingMatrix, game.bullets[i].radius);
								Mat4x4.multiply( bulletNodes[i].transform, bulletNodes[i].transform, scalingMatrix);
						}
				}
				{ // ADDITIONAL BALL MOVEMENT
						for(var i = 0; i < game.additionalBalls.length; ++i){
								Mat4x4.makeTranslation(additionalBallsNodes[i].transform, [game.additionalBalls[i].position[0], game.additionalBalls[i].position[1], 0]);
								Mat4x4.makeScalingUniform(scalingMatrix, game.ballScale);
								Mat4x4.multiply( additionalBallsNodes[i].transform, additionalBallsNodes[i].transform, scalingMatrix);
						}
				}


				{ // CAMERA MOVEMENT
						if(game.keysDown[81]){       // pressing Q
								game.cameraAngle = game.cameraGrazingAngle; // grazing
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

				{ //LIGHT MOVEMENT
						lightNode_point.nodeObject.position = [game.ball.position[0], game.ball.position[1], 0];
						lightNode_spot_left.nodeObject.position = [game.platform.position[0] - game.platform.width/2, game.platform.position[1] - game.platform.height, 0];
						lightNode_spot_right.nodeObject.position = [game.platform.position[0] + game.platform.width/2, game.platform.position[1] - game.platform.height, 0];
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
