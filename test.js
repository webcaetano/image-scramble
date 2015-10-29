var expect = require('chai').expect;
var async = require('async');
var fs = require('fs');
var imgScramble = require('./');


describe('image-scramble', function() {

	it('should do something', function(done) {
		// console.log('oi<-')
		this.timeout(60000);
		imgScramble({
			image:'test/2.png',
			seed:'Kappa',
			sliceSize:5,
			dest:'test/2_crop.png'
		},function(err,results){
			console.log(err)
			done();
		})
		// done();
	});

})
