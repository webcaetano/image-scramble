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
			this.x = pos.x;
			this.y = pos.y;
			this.size = (options.sliceSize-(pos.x+options.sliceSize<=sizeImg.width ?  0 : (pos.x+options.sliceSize)-sizeImg.width))+"-"+
			(options.sliceSize-(pos.y+options.sliceSize<=sizeImg.height ?  0 : (pos.y+options.sliceSize)-sizeImg.height))
			callback(err,image);
		});
	}

	var getTotalParts = function(sizeImg){
		return Math.ceil(sizeImg.width/options.sliceSize)*Math.ceil(sizeImg.height/options.sliceSize);
	}

	var getColsInGroup = function(slices){
		var y = 'init';
		for(var i=0;i<slices.length;i++){
			if(y=='init') y = slices[i].y;
			if(y!=slices[i].y){
				return i;
				console.log(slices[i].y)
				break;
			}
		}
		return 0;
	}

	var getGroup = function(sliceSize,slices,sizeImg){
		sliceSize = sliceSize.split('-');
		var self = {};

		if(sliceSize[0]==options.sliceSize && sliceSize[1]==options.sliceSize){
			var cols = getColsInGroup(slices);
			return {
				type:'normal',
				x:0,
				y:0,
				width:cols*options.sliceSize,
				height:(slices.length/cols)*options.sliceSize
			};
		} else if(sliceSize[0]!=options.sliceSize && sliceSize[1]==options.sliceSize){
			return {
				type:'side',
				x:sizeImg.width-sliceSize[0],
				y:0,
				width:sliceSize[0],
				height:slices.length*options.sliceSize
			};
		} else if(sliceSize[0]==options.sliceSize && sliceSize[1]!=options.sliceSize){
			return {
				type:'bottom',
				x:0,
				y:sizeImg.height-sliceSize[1],
				width:slices.length*options.sliceSize,
				height:sliceSize[1]
			};
		} else if(sliceSize[0]!=options.sliceSize && sliceSize[1]!=options.sliceSize){
			return {
				type:'corner',
				x:sizeImg.width-sliceSize[0],
				y:sizeImg.height-sliceSize[1],
				width:sliceSize[0],
				height:sliceSize[1]
			};
		}
		return self;
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
			// async.parallel(run,callback)
			async.parallel(run,function(err,data){
				var resp = {};
				_.forEach(data,function(slice){
					if(!resp[slice.size]) resp[slice.size]=[];
					resp[slice.size].push(slice)
				});
				callback(err,resp);
			})
		}],
		save:['slices',function(callback,results){
			var totalParts = results.totalParts;
			var allSlices = [];
			// var types = {};
			// _.forEach(results.slices,function(slices,k){
			// 	types[k] = getGroup(k,slices.results.getSize.bitmap)
			// 	results.slices[k] = shuffleSeed.shuffle(slices,options.seed)
			// 	allSlices = allSlices.concat(results.slices[k]);
			// })

			new Jimp(results.getSize.bitmap.width,results.getSize.bitmap.height,function(err, image){
				// for(var i=0;i<totalParts;i++){
				// 	if()
				// 	var pos  = getPartPos(i,results.getSize.bitmap);
				// 	this.blit( allSlices[i], pos.x, pos.y )
				// }
				_.forEach(results.slices,function(slices,k){
					var group = getGroup(k,slices,results.getSize.bitmap)
					slices = shuffleSeed.shuffle(slices,options.seed)
					_.forEach(slices,function(slice,i){
						var pos  = getPartPos(i,group);
						image.blit(slice, group.x+pos.x, group.y+pos.y)
					})
					// allSlices = allSlices.concat(results.slices[k]);
				})
				image.write(options.dest,callback)
			});
		}]
	},done)
}


