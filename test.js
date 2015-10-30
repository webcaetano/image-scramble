var expect = require('chai').expect;
var async = require('async');
var fs = require('fs');
var imgScramble = require('./');


describe('image-scramble', function() {

	it('should do something', function(done) {
		// console.log('oi<-')
		this.timeout(10000);
		imgScramble({
			image:'test/sample3.png',
			seed:'Kappa',
			sliceSize:5,
			dest:'test/sample3_crop.png'
		},function(err,results){
			console.log(err)
			done();
		})
		// done();
	});

})
