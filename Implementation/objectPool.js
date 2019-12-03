function ObjectPool(){
		this.pool = []; // to be set by user
		this.index = 0;

		this.getNext = function(){
				this.index++;
				if(this.index >= this.pool.length){
						this.index = 0;
				}
				return this.pool[this.index];
		}
}
