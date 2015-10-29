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
		crop:['getSize',function(callback,results){
			getPart(6,results.getSize.bitmap,callback)
		}],
		save:['crop',function(callback,results){
			var pos  = getPartPos(6,results.getSize.bitmap);

			new Jimp(results.getSize.bitmap.width,results.getSize.bitmap.height,function(err, image){
				console.log(err)
				this.composite( results.crop, pos.x, pos.y )
				.write(options.dest,callback)
			});
		}]
	},done)
}


