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
		return {
			x:options.sliceSize*(part%(sizeImg.width/options.sliceSize)),
			y:options.sliceSize*Math.floor(part/(sizeImg.height/options.sliceSize))
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
		return (sizeImg.width*sizeImg.height)/(options.sliceSize*options.sliceSize);
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
			new Jimp('./test/emptyPixel.png',function(err, image){
				this.resize(results.getSize.bitmap.width,results.getSize.bitmap.height);
				for(var i=0;i<totalParts;i++){
					var pos  = getPartPos(i,results.getSize.bitmap);
					this.blit( results.slices[i], pos.x, pos.y )
				}
				this.write(options.dest,callback)
			});
		}]
	},done)
}


