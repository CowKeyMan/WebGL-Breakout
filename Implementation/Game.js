function Game(){
		this.startTime = Date.now();

		this.lives = 3;
		this.deathLevel = -7; // position y of ball to be dead
		this.points = 0;

		this.wallWidth = 16;
		this.wallHeight = 10;

		this.brickRows = 5;
		this.brickColumns = 9;

		this.platformSpeed = 0.1;
		this.platformScale = 2.5;

		this.minCameraSpeed = 0.01;
		this.maxCameraSpeed = 0.1;
		this.cameraSpeed = 0.03;
		this.cameraAcceleration = 0.01;
		this.cameraGrazingAngle = Math.PI/2 * 2/3;
		this.cameraAngle=0;

		this.ballScale = 0.5;
		this.ballAccellerationPerFrame = 0.1/60; // when holding spacebar
		this.ballLaunchVelocity = 0.1;
		this.maxBallVelocity = 0.3;
		this.maxBallVelocityMultiplier = 1;
		this.ballVelocity = 0.1
		this.ballIsStuck = true;

		this.powerupVelocity = -0.2;

		{ // The different powerups
				this.troughBricksAmount = 7 * 1000;
				this.troughBricksStartTime = this.startTime - this.troughBricksAmount;

				this.widePlatformAmount = 7 * 1000;
				this.widePlatformStartTime = this.startTime - this.widePlatformAmount;
				this.platformWidthMultiplier = 1.3;

			 this.halfSpeedAmount = 10 * 1000;
				this.halfSpeedStartTime = this.startTime - this.halfSpeedAmount;

				this.maxStuckAmount = 2;
				this.stuckAmount = 0;

				this.maxBulletAmount = 3;
				this.bulletAmount = 0;
				this.canShoot = true;
				this.bulletVelocity = 0.4;
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

		this.canPlayChargeSound = true;

		this.firstTime = true;
		this.keysDown = new Array(512).fill(false); // Used as a hash list. If keycode is down, index equivalent to that keycode is true

		this.onKeyDown = function(e){ 
				this.keysDown[e.keyCode] = true; 

				
				if(e.keyCode == 32 && this.ballIsStuck && this.canPlayChargeSound){
						if(this.firstTime){
								this.firstTime = false;
								document.getElementById("theme").play();
						}
						document.getElementById("ChargeUp").play();
						this.canPlayChargeSound = false;
				}

				if(e.keyCode == 38 && this.canShoot && this.bulletAmount > 0){
					 console.log(this.bulletAmount);
						this.bulletAmount--;
						this.canShoot = false;
						var b = this.bulletPool.getNext();
						b.position = [this.platform.position[0], this.platform.position[1]];
						b.velocity = [0, this.bulletVelocity];
						document.getElementById("BulletShot").currentTime = 0;
						document.getElementById("BulletShot").play();
				}
		}

		this.onKeyUp = function(e){
				this.keysDown[e.keyCode] = false;

				if(e.keyCode == 32 && this.ballIsStuck){ // ON RELEASE SPACEBAR
						if(this.points < this.brickRows * this.brickColumns){
								document.getElementById("ChargeUp").pause();
								document.getElementById("ChargeUp").currentTime = 0;
								this.canPlayChargeSound = true;
								this.ballIsStuck = false;
								this.prepForLaunch = false;
								this.ballLaunchVelocity = (this.ballLaunchVelocity > this.maxBallVelocity)? this.maxBallVelocity : this.ballLaunchVelocity;
								this.ballVelocity = this.ballLaunchVelocity;
								changeVelocityFromPoint(this.ball.velocity, [this.platform.position[0], this.platform.position[1] - 2], this.ball.position, this.ballVelocity);
								this.ballLaunchVelocity = 0.1;
						}
				}


				if(e.keyCode == 38){
						this.canShoot = true;
				}
		}
}
