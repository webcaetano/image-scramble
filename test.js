var expect = require('chai').expect;
var async = require('async');
var fs = require('fs');
var imgScramble = require('./');


describe('image-scramble', function() {

	it('should do something', function(done) {
		// console.log('oi<-')
		imgScramble({
			image:'test/2.png',
			sliceSize:25,
			dest:'test/1_crop.png'
		},function(err,results){
			console.log(err,results)
			done();
		})
		// done();
	});

})
