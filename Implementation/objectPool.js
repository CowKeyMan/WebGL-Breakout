function ObjectPool(){
		this.pool = []; // to be set by user
		this.index = 0;

		this.getNext = function(){
				this.index = (this.index+1) % this.pool.length;
				return this.pool[this.index];
		}
}
