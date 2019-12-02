function RectObject(){
		this.position = [0, 0];
		this.velocity = [0, 0];
		this.width = 0;
		this.height = 0;
}

function CircObject(){
		this.position = [0, 0];
		this.velocity = [0, 0];
		this.radius = 0;
}

function euclidean_distance(x1, y1, x2, y2){
		return Math.sqrt(Math.pow( (x1-x2), 2) + Math.pow( (y1-y2), 2 ) );
}

function CollisionRectCirc(r, c){
		var rect_center_X = r.position[0], rect_center_Y = r.position[1];
		var rect_height = r.height, rect_width = r.width;
		var circ_center_X = c.position[0], circ_center_Y = c.position[1];
		var circ_radius = c.radius;

		if(euclidean_distance(rect_center_X - rect_width/2, rect_center_Y - rect_height/2, circ_center_X, circ_center_Y) < circ_radius){
				return COLLISION_TYPE.BOTTOM_LEFT;
		} else if(euclidean_distance(rect_center_X + rect_width/2, rect_center_Y - rect_height/2, circ_center_X, circ_center_Y) < circ_radius){
				return COLLISION_TYPE.BOTTOM_RIGHT;
		} else if(euclidean_distance(rect_center_X - rect_width/2, rect_center_Y + rect_height/2, circ_center_X, circ_center_Y) < circ_radius){
				return COLLISION_TYPE.TOP_LEFT;
		} else if(euclidean_distance(rect_center_X + rect_width/2, rect_center_Y + rect_height/2, circ_center_X, circ_center_Y) < circ_radius){
				return COLLISION_TYPE.TOP_RIGHT;
		}

		if(circ_center_Y < rect_center_Y + rect_height/2 && circ_center_Y > rect_center_Y - rect_height/2){
				if( circ_center_X - circ_radius < rect_center_X + rect_width/2 && circ_center_X > rect_center_X){
						return COLLISION_TYPE.RIGHT;
				} else if( circ_center_X + circ_radius > rect_center_X - rect_width/2 && circ_center_X < rect_center_X){
						return COLLISION_TYPE.LEFT;
				}
		}else if(circ_center_X < rect_center_X + rect_width/2 && circ_center_X > rect_center_X - rect_width/2){
				if( circ_center_Y - circ_radius < rect_center_Y + rect_height/2 && circ_center_Y > rect_center_Y){
						return COLLISION_TYPE.TOP;
				} else if( circ_center_Y + circ_radius > rect_center_Y - rect_height/2 && circ_center_Y < rect_center_Y){
						return COLLISION_TYPE.BOTTOM;
				}
		}
		
		return COLLISION_TYPE.NONE;
}

function CollisionCircCirc(c1, c2){
		var circ1_center_X = c1.position[0], circ1_center_Y = c1.position[1];
		var circ1_radius = c1.radius;
		var circ2_center_X = c2.position[0], circ2_center_Y = c2.position[1];
		var circ2_radius = c2.radius;

		if(euclidean_distance(circ1_center_X, circ1_center_Y, circ2_center_X, circ2_center_Y) < circ1_radius + circ2_radius){
				return true;
		}
		return false;
}

COLLISION_TYPE = {
		NONE: 0,
		TOP: 1,
		BOTTOM: 2,
		LEFT: 3,
		RIGHT: 4,
		TOP_LEFT: 5,
		TOP_RIGHT: 6,
		BOTTOM_LEFT: 7,
		BOTTOM_RIGHT: 8
}

function getDirectionVector(res, origin, destination){
		var magnitude = euclidean_distance(origin[0], origin[1], destination[0], destination[1]);

		res[0] = (destination[0] - origin[0])/magnitude
		res[1] = (destination[1] - origin[1])/magnitude;
}

function multiply(out, a, s){
		out[0] = a[0] * s;
		out[1] = a[1] * s;
}

function changeVelocityFromPoint(velocity, origin, destination, magnitude){
		getDirectionVector(velocity, origin, destination);

		multiply(velocity, velocity, magnitude);
}

function move(o){
		o.position[0] += o.velocity[0];
		o.position[1] += o.velocity[1];
}

function moveMultiply(o, multiplier){
		o.position[0] += o.velocity[0] * multiplier;
		o.position[1] += o.velocity[1] * multiplier;
}
