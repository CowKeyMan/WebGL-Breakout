function Game(){
		this.startTime = Date.now();

		// parameters which determine game ending
		this.lives = 3; // number of lives remaining
		this.points = 0; // number of bricks destroyed
		this.deathLevel = -7; // position y of ball to be dead

		this.wallWidth = 16; // how far apart the 2 vertical bricks are
		this.wallHeight = 10;

		// number of bricks is brickRows * brickColumns
		this.brickRows = 5;
		this.brickColumns = 9;

		// platform parameters
		this.platformSpeed = 0.1;
		this.platformScale = 2.5;

		// camera moevement
		this.minCameraSpeed = 0.01;
		this.maxCameraSpeed = 0.1; 
		this.cameraSpeed = 0.03; // how fast the camera turns
		this.cameraAcceleration = 0.01; // how much to de/increase the camera speed by
		this.cameraGrazingAngle = Math.PI/2 * 2/3; // the maximum angle of the camera
		this.cameraAngle=0; // the current camera angle

		// ball parameters
		this.ballScale = 0.5; // radius of the ball
		this.ballAccellerationPerFrame = 0.1/60; // when holding spacebar
		this.ballLaunchVelocity = 0.1; // minimum ball velocity
		this.maxBallVelocity = 0.3; // the maximum velocity at launch
		this.ballVelocity = 0.1; // current velocity of the ball
		this.ballIsStuck = true; // if the ball is currently on the platform

		this.powerupVelocity = -0.2; // downwards velocity of the powerups

		{ // The different powerups
				this.troughBricksAmount = 7 * 1000; // duration
				this.troughBricksStartTime = this.startTime - this.troughBricksAmount;

				this.widePlatformAmount = 7 * 1000; // duration
				this.widePlatformStartTime = this.startTime - this.widePlatformAmount;
				this.platformWidthMultiplier = 1.3; // how much bigger the pltform becomes

			 this.halfSpeedAmount = 10 * 1000; // duration
				this.halfSpeedStartTime = this.startTime - this.halfSpeedAmount;

				this.maxStuckAmount = 2; // number of times ball can get stuck after picking the powerup (Reset per powerup)
				this.stuckAmount = 0; // how many times left where the ball sticks to the platform

				this.maxBulletAmount = 3; // number of bullets player has when bullet powerup is obtained (Reset per poerup)
				this.bulletAmount = 0; // number of bullets left
				this.bulletVelocity = 0.4; // upwards velocity of bullet
		}

		// Physics Objects
		this.walls = [
				new RectObject(),
				new RectObject(),
				new RectObject(),
		];

		this.bricks = []; // Array of RectObject

		this.platform = new RectObject();

		this.ball = new CircObject();

		this.powerupPoolAmount = 10;
		this.powerups = []
		this.powerupPool = new ObjectPool();
		this.powerupPool.pool = this.powerups;

		this.bulletPoolAmount = 10;
		this.bullets = [];
		this.bulletPool = new ObjectPool();
		this.bulletPool.pool = this.bullets;

		this.additionalBallsPoolAmount = 10;
		this.additionalBalls = [];
		this.additionalBallPool = new ObjectPool();
		this.additionalBallPool.pool = this.additionalBalls;

		this.particlesPoolAmount = 10; // how many pools of particles to create
		this.particlesPerPool = 4; // how many particles there are attributed to each pool
		this.particlesDuration = 0.2 * 1000; // the time the particles spend on screen
		this.particlesMaxVelocity = 0.2 // the maximum particle velocity
		this.particlesStartTime = new Array(this.particlesPoolAmount).fill(Date.now() - this.particlesDuration); // the time where each particle pool started
		this.particles = []; // the particlels themselves (array of size particlesPoolAmount * particlesPerPool)
		this.particlesPool = new ObjectPool(); // the object pool for the particles
		this.particlesPool.pool = this.particles;
		this.particlesSize = 0.3; // radius of the particles
		
		this.canPlayChargeSound = true; // So that it doesnt restart while spacebar is held

		this.keysDown = new Array(256).fill(false); // Used as a hash list. If keycode is down, index equivalent to that keycode is true

		this.onKeyDown = function(e){ 
				this.keysDown[e.keyCode] = true; // add to keys down
				
				if(e.keyCode == 32 && this.ballIsStuck && this.canPlayChargeSound){ // SPACEBAR -- Launch ball
						document.getElementById("theme").play();
						document.getElementById("ChargeUp").play();
						this.canPlayChargeSound = false;
				}

				if(e.keyCode == 38 && this.canShoot && this.bulletAmount > 0){ // UP ARROW -- Shoot buller
						this.bulletAmount--;
						this.canShoot = false; // So that is button is held, the shots are not fired consecutively, but must be pressed again
						var b = this.bulletPool.getNext();
						b.position = [this.platform.position[0], this.platform.position[1]];
						b.velocity = [0, this.bulletVelocity];
						document.getElementById("BulletShot").currentTime = 0;
						document.getElementById("BulletShot").play();
				}
		}

		this.onKeyUp = function(e){
				this.keysDown[e.keyCode] = false; // remove from keys down

				if(e.keyCode == 32 && this.ballIsStuck){ // ON RELEASE SPACEBAR
						if(this.points < this.brickRows * this.brickColumns){
								document.getElementById("ChargeUp").pause();
								document.getElementById("ChargeUp").currentTime = 0;
								this.canPlayChargeSound = true;
								this.ballIsStuck = false;
								this.ballLaunchVelocity = (this.ballLaunchVelocity > this.maxBallVelocity)? this.maxBallVelocity : this.ballLaunchVelocity;
								this.ballVelocity = this.ballLaunchVelocity;
								changeVelocityFromPoint(this.ball.velocity, [this.platform.position[0], this.platform.position[1] - 2], this.ball.position, this.ballVelocity);
								this.ballLaunchVelocity = 0.1;
						}
				}


				if(e.keyCode == 38){ // UP ARROW -- Allow player to shoot again (if he has any bullets left)
						this.canShoot = true;
				}
		}
}
