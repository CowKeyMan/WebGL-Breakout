function Game(){
		this.wallWidth = 16;
		this.wallHeight = 10;

		this.brickRows = 5;
		this.brickColumns = 9;

		this.platformScale = 3;

		this.keysDown = new Array(512).fill(false); // Used as a hash table. If keycode is down, index equivalent to that keycode is true

		this.platformSpeed = 0.1;

		this.platformWidthMultiplier = 1;

		this.minCameraSpeed = 0.01;
		this.maxCameraSpeed = 0.1;
		this.cameraSpeed = 0.03;
		this.cameraAcceleration = 0.01;
		this.cameraGrazingAngle = Math.PI/2 * 2/3;
		this.cameraAngle=0;

		// Game objects stuff
		this.ballScale = 0.5;
		this.ballAccellerationPerFrame = 0.1/60; // when holding spacebar
		this.ballLaunchVelocity = 0.1;
		this.maxBallVelocity = 0.3;
		this.maxBallVelocityMultiplier = 1;
		this.ballIsStuck = true;

		this.ball = new CircObject();

		this.platform = new RectObject();
		this.bricks = []; // Array of RectObject
		this.walls = [
				new RectObject(),
				new RectObject(),
				new RectObject(),
				];

		this.onKeyDown = function(e){ 
				this.keysDown[e.keyCode] = true; 

				if(e.keyCode == 32){ // SPACEBR
						console.log('hi');
						ballLaunchVelocity = 0.1;
				}
		}
		this.onKeyUp = function(e){
				this.keysDown[e.keyCode] = false;
				if(e.keyCode == 32 && this.ballIsStuck){
						this.ballIsStuck = false;
						this.prepForLaunch = false;
						this.ballLaunchVelocity = (this.ballLaunchVelocity > this.maxBallVelocity)? this.maxBallVelocity : this.ballLaunchVelocity;
						this.ball.velocity = [0, this.ballLaunchVelocity];
				}
		}
}
