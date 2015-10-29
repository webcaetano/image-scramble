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

		var verticalSlices=Math.ceil(sizeImg.width/options.sliceSize);
		var row=parseInt(part/verticalSlices);
		var col=part-row*verticalSlices;

		return {
			x:Math.floor(col*options.sliceSize),
			y:Math.floor(row*options.sliceSize)
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
		return Math.ceil(sizeImg.width/options.sliceSize)*Math.ceil(sizeImg.height/options.sliceSize);
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
			new Jimp(Math.ceil(results.getSize.bitmap.width/options.sliceSize)*options.sliceSize,Math.ceil(results.getSize.bitmap.height/options.sliceSize)*options.sliceSize,function(err, image){
				for(var i=0;i<totalParts;i++){
					var pos  = getPartPos(i,results.getSize.bitmap);
					this.blit( results.slices[i], pos.x, pos.y )
				}
				this.write(options.dest,callback)
			});
		}]
	},done)
}


