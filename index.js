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

	var getPart = function(part,sizeImg){
		return {
			x:options.sliceSize*(part%(sizeImg.width/options.sliceSize)),
			y:options.sliceSize*Math.floor(part/(sizeImg.height/options.sliceSize))
		};
	}

	var getTotalParts = function(sizeImg){
		return (sizeImg.width*sizeImg.height)/(options.sliceSize*options.sliceSize);
	}

	var getPartBuffer = function(part,sizeImg,callback){
		console.log(getTotalParts(sizeImg));
		var part = getPart(part,sizeImg);

		new Jimp(options.image, function(err,image){
			this.crop(part.x,part.y,options.sliceSize,options.sliceSize)
			.getBuffer( Jimp.MIME_PNG, callback);
		});
	}

	async.auto({
		getSize:function(callback){
			new Jimp(options.image, callback);
		},
		crop:['getSize',function(callback,results){
			getPartBuffer(6,results.getSize.bitmap,callback)
		}],
		save:['crop',function(callback,results){
			// new Jimp(results.crop, function(err,image){
			// 	this.write(options.dest,callback)
			// })
	console.log(new Buffer('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12P4zwAAAgEBAKrChTYAAAAASUVORK5CYII=', 'base64'))
			new Jimp(results.getSize.bitmap.width,results.getSize.bitmap.height,function(err, image){
				// this.resize(results.getSize.bitmap.width,results.getSize.bitmap.height)
				console.log(err)
				this
				.write(options.dest,callback)
			});


			// .composite(tmpImg)
			// .geometry((emblem.x>= 0 ? '+' : '')+emblem.x+(emblem.y>= 0 ? '+' : '')+emblem.y)
			// .write(path.join(root,'/src/images/emblem/gr/'+id+'.png'), function (err,result) {
			// 	fs.unlinkSync(tmpImg);
			// 	callback(err,result);
			// });
		}]
	},done)
}


