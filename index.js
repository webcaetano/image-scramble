var async = require('async');
var _ = require('lodash');
var Jimp = require("jimp");
var fs = require('fs');
var path = require('path');
var shuffleSeed = require('shuffle-seed');

var defaults = {
	sliceSize:5,
	buffer:false
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
			// callback(err,image);
			callback(err,image);
			// image.getBuffer( Jimp.MIME_PNG, callback)
		});
	}

	var getTotalParts = function(sizeImg){
		return Math.ceil(sizeImg.width/options.sliceSize)*Math.ceil(sizeImg.height/options.sliceSize);
	}

	var getColsInGroup = function(slices){
		if(slices.length==1) return 1;
		var t = 'init';
		for(var i=0;i<slices.length;i++){
			if(t=='init') t = slices[i].pos.y;
			if(t!=slices[i].pos.y){
				return i;
				break;
			}
		}
		return i;
	}

	var getGroup = function(slices,sizeImg){
		sliceSize = slices[0].size.split('-');
		var self = {};
		self.slices = slices.length;
		self.cols = getColsInGroup(slices);
		self.rows = slices.length/self.cols;
		self.width = sliceSize[0]*self.cols;
		self.height = sliceSize[1]*self.rows;
		self.x = slices[0].pos.x;
		self.y = slices[0].pos.y;
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
					var group = getGroup(slices,results.getSize.bitmap);
					var shuffleInd = [];
					for(var i=0;i<slices.length;i++) shuffleInd.push(i);

					shuffleInd = shuffleSeed.shuffle(shuffleInd,options.seed);

					async.forEachOfLimit(slices,50,function(slice,i,callback){
						getSliceImage(slice,i,group,function(err, sliceImg){
							var pos  = getPartPos(shuffleInd[i],group);
							image.blit(sliceImg, group.x+pos.x, group.y+pos.y);
							delete sliceImg;
							callback(err);
						});
					},done)
				},function(err){
					if(err) callback(err);
					if(!options.buffer){
						image.write(options.dest,callback)
					} else {
						image.getBuffer( Jimp.MIME_PNG, callback );
					}
				})
			});
		}]
	},function(err,results){
		done(err,options.buffer ? results.save : null)
	});
}
