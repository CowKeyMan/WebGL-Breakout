function Game(){
		this.wallWidth = 16;
		this.wallHeight = 10;

		this.brickRows = 3;
		this.brickColumns = 9;

		this.platformScale = 3;
		this.ballScale = 0.5;

		this.platformPositionX = 0;

		this.ballPosition = [0,0 - this.ballScale];
}
