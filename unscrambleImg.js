;(function() {
	var self = function(img,sliceSize,seed,bmp){
		var i;
		var totalParts = Math.ceil(img.width/sliceSize)*Math.ceil(img.height/sliceSize);
		var inds = [];
		for(i=0;i<totalParts;i++) inds.push(i);
		if(!bmp){
			var canvas=document.createElement("canvas");
			var ctx=canvas.getContext('2d');
			canvas.width=img.width;
			canvas.height=img.height;
		} else {
			var ctx = bmp.ctx;
		}


		var verticalSlices=Math.ceil(img.width/sliceSize);
		var horizontalSlices=img.height/sliceSize;
		var slices = {}

		var getSlices = function(){
			var slices = {};
			var i;
			for(i=0;i<totalParts;i++){
				var slice = {};
				var row=parseInt(i/verticalSlices);
				var col=i-row*verticalSlices;
				slice.x=col*sliceSize;
				slice.y=row*sliceSize;
				slice.width=(sliceSize-(slice.x+sliceSize<=img.width ?  0 : (slice.x+sliceSize)-img.width));
				slice.height=(sliceSize-(slice.y+sliceSize<=img.height ?  0 : (slice.y+sliceSize)-img.height));
				if(!slices[slice.width+"-"+slice.height]) slices[slice.width+"-"+slice.height]=[];
				slices[slice.width+"-"+slice.height].push(slice);
			}
			return slices;
		}

		var getColsInGroup = function(slices){
			if(slices.length==1) return 1;
			var t = 'init';
			for(var i=0;i<slices.length;i++){
				if(t=='init') t = slices[i].y;
				if(t!=slices[i].y){
					return i;
					break;
				}
			}
			return i;
		}

		var getGroup = function(slices){
			var self = {};
			self.slices = slices.length;
			self.cols = getColsInGroup(slices);
			self.rows = slices.length/self.cols;
			self.width = slices[0].width*self.cols;
			self.height = slices[0].height*self.rows;
			self.x = slices[0].x;
			self.y = slices[0].y;
			return self;
		}

		var slices = getSlices();
		for(var g in slices){
			var group = getGroup(slices[g]);
			var shuffleInd = [];
			var i;
			for(i=0;i<slices[g].length;i++) shuffleInd.push(i);
			shuffleInd = shuffleSeed.shuffle(shuffleInd,seed);
			for(i=0;i<slices[g].length;i++){
				var s=shuffleInd[i];

				var row=parseInt(s/group.cols);
				var col=s-row*group.cols;
				var x=col*slices[g][i].width;
				var y=row*slices[g][i].height;

				ctx.drawImage(
					img,
					group.x+x,
					group.y+y,
					slices[g][i].width,
					slices[g][i].height,
					slices[g][i].x,
					slices[g][i].y,
					slices[g][i].width,
					slices[g][i].height
				);
			}
		}
		if(!bmp){
			return canvas;
		} else {
			return bmp;
		}
	}

	if(typeof exports!=='undefined'){
		module.exports=self;
	} else {
		this['unscrambleImg']=self;
	}
}.call(this));
