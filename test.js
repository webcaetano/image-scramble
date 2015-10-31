var expect = require('chai').expect;
var async = require('async');
var fs = require('fs');
var imgScramble = require('./');


describe('image-scramble', function() {

	it('should do something', function(done) {
		this.timeout(5000);
		imgScramble({
			image:'test/sample2.png',
			seed:'Kappa',
			sliceSize:5,
			dest:'test/sample2_crop.png'
		},function(err,results){
			expect(err).to.be.null;
			done();
		})
	});

})
