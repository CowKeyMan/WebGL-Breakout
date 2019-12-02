function ObjectPool(){
		this.pool = []; // to be set by user
		this.index = 0;

		this.getNext = function(){
				var item = this.pool[this.index];
				this.index++;
				if(this.index >= this.pool.length){
						this.index = 0;
				}
				return item;
		}
}
