var async = require('async');
var _ = require('lodash');
var Jimp = require("jimp");
var fs = require('fs');
var path = require('path');
var shuffleSeed = require('shuffle-seed');

var defaults = {
	sliceSize:5
};

module.exports = function(options,done){
	options = _.extend({},defaults,options);

	var getPartPos = function(part,sizeImg){
		console.log(Math.floor(part/(sizeImg.height/options.sliceSize)))

		var verticalSlices=sizeImg.width/options.sliceSize;
		var horizontalSlices=sizeImg.height/options.sliceSize;
		var row=parseInt(part/verticalSlices);
		var col=part-row*verticalSlices;
		var x=Math.floor(col*options.sliceSize);
		var y=Math.floor(row*options.sliceSize);

		// console.log(x+" "+y)
		// var canvasRow=parseInt(i/verticalSlices);
		// var canvasCol=i-canvasRow*verticalSlices;
		// var canvasX=canvasCol*sliceSize;
		// var canvasY=canvasRow*sliceSize;

		return {
			x:x,
			// y:options.sliceSize*Math.floor(part/(sizeImg.height/options.sliceSize))
			y:y
		};
	}

	var getPart = function(part,sizeImg,callback){
		var pos = getPartPos(part,sizeImg)
		new Jimp(options.image, function(err,image){
			this.crop(pos.x,pos.y,options.sliceSize,options.sliceSize)
			callback(err,image);
		});
	}

	var getTotalParts = function(sizeImg){
		return Math.floor((sizeImg.width*sizeImg.height)/(options.sliceSize*options.sliceSize));
	}

	async.auto({
		getSize:function(callback){
			new Jimp(options.image, callback);
		},
		totalParts:['getSize',function(callback,results){
			callback(null,getTotalParts(results.getSize.bitmap));
		}],
		slices:['totalParts',function(callback,results){
			var totalParts = results.totalParts;
			var run = [];
			// console.log(totalParts)

			_.map(new Array(totalParts),function(e,i){
				run.push(function(cb){
					getPart(i,results.getSize.bitmap,cb)
				})
			})
			async.parallel(run,callback)
		}],
		save:['slices',function(callback,results){
			var totalParts = results.totalParts;
			results.slices = shuffleSeed.shuffle(results.slices,options.seed)
			new Jimp(results.getSize.bitmap.width,results.getSize.bitmap.height,function(err, image){
				for(var i=0;i<totalParts;i++){
					var pos  = getPartPos(i,results.getSize.bitmap);
					this.blit( results.slices[i], pos.x, pos.y )
				}
				this.write(options.dest,callback)
			});
		}]
	},done)
}


