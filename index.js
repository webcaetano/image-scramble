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
		var self = {};
		var pos = getPartPos(part,sizeImg)
		self.pos = pos;
		self.size = (options.sliceSize-(pos.x+options.sliceSize<=sizeImg.width ?  0 : (pos.x+options.sliceSize)-sizeImg.width))+
			"-"+
			(options.sliceSize-(pos.y+options.sliceSize<=sizeImg.height ?  0 : (pos.y+options.sliceSize)-sizeImg.height))
		return self;
	}


	var getSliceImage = function(slice,ind,group,callback){
		var pos = getPartPos(ind,group);
		var size = slice.size.split("-");
		new Jimp(options.image, function(err,image){
			image.crop(group.x+pos.x,group.y+pos.y,parseInt(size[0]),parseInt(size[1]))
			callback(err,image);
		});
	}

	var getTotalParts = function(sizeImg){
		return Math.ceil(sizeImg.width/options.sliceSize)*Math.ceil(sizeImg.height/options.sliceSize);
	}

	var getColsInGroup = function(slices){
		var y = 'init';
		for(var i=0;i<slices.length;i++){
			if(y=='init') y = slices[i].pos.y;
			if(y!=slices[i].pos.y){
				return i;
				console.log(slices[i].pos.y)
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
		getSlices:['totalParts',function(callback,results){
			var totalParts = results.totalParts;
			var slices = {};

			_.map(new Array(totalParts),function(e,i){
				var s = getPart(i,results.getSize.bitmap);
				if(!slices[s.size]) slices[s.size]=[];
				slices[s.size].push(s)
			})

			callback(null,slices);
		}],
		save:['getSlices',function(callback,results){
			var totalParts = results.totalParts;
			var allSlices = [];

			new Jimp(results.getSize.bitmap.width,results.getSize.bitmap.height,function(err, image){
				async.forEachOf(results.getSlices,function(slices,k,done){
					var group = getGroup(k,slices,results.getSize.bitmap);
					var shuffleInd = [];
					for(var i=0;i<slices.length;i++) shuffleInd.push(i);

					shuffleInd = shuffleSeed.shuffle(shuffleInd,options.seed);

					async.forEachOf(slices,function(slice,i,callback){
						getSliceImage(slice,i,group,function(err, sliceImg){
							var pos  = getPartPos(shuffleInd[i],group);
							image.blit(sliceImg, group.x+pos.x, group.y+pos.y)
							callback();
						});
					},done)
				},function(err){
					console.log(err)
					console.log('1')
					image.write(options.dest,callback)
				})
			});
		}]
	},done)
}
