function Game(){
		this.wallWidth = 16;
		this.wallHeight = 10;

		this.brickRows = 5;
		this.brickColumns = 9;

		this.platformScale = 3;
		this.ballScale = 0.5;

		this.platformPositionX = 0;

		this.ballPosition = [0,0 - this.ballScale];

		this.keysDown = new Array(512).fill(false); // Used as a hash table. If keycode is down, index equivalent to that keycode is true

		this.platformSpeed = 0.1;

		this.minCameraSpeed = 0.01;
		this.maxCameraSpeed = 0.1;
		this.cameraSpeed = 0.03;
		this.cameraAcceleration = 0.01;
		this.cameraGrazingAngle = Math.PI/2 * 2/3;
		this.cameraAngle=0;
}
