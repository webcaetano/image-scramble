var async = require('async');
var _ = require('lodash');
var gm = require('gm');
var fs = require('fs');
var path = require('path');


var defaults = {
	sliceSize:5
};

module.exports = function(options,done){
	options = _.extend({},defaults,options);

	var getPieceImage = function(x,y,callback){
		gm(options.image)
		.crop(options.sliceSize,options.sliceSize,x,y)
		.toBuffer('PNG',callback)
	}

	var getPart = function(part,sizeImg){
		return {
			x:options.sliceSize*(part%(sizeImg.width/options.sliceSize)),
			y:options.sliceSize*Math.floor(part/(sizeImg.height/options.sliceSize))
		};
	}

	var getPartBuffer = function(part,sizeImg,callback){
		var part = getPart(part,sizeImg);
		getPieceImage(part.x,part.y,callback)
	}

	async.auto({
		getSize:function(callback){
			gm(options.image)
			.size(callback)
		},
		crop:['getSize',function(callback,results){
			getPartBuffer(1,results.getSize,callback)
		}],
		save:['crop',function(callback,results){
			gm(results.crop)
			.write(options.dest,callback)
		}]
	},done)
}
