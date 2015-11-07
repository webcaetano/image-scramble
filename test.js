var expect = require('chai').expect;
var async = require('async');
var fs = require('fs');
var imgScramble = require('./');


describe('image-scramble', function() {

	it('should create shuffle image and write', function(done) {
		this.timeout(50000);
		imgScramble({
			image:'examples/sample5.png',
			seed:'Kappa',
			sliceSize:20,
			dest:'examples/sample5_crop.png'
		},function(err,results){
			expect(err).to.be.null;
			done();
		})
	});

	// it('should create shuffle image and return buffer', function(done) {
	// 	this.timeout(5000);
	// 	imgScramble({
	// 		image:'examples/sample2.png',
	// 		seed:'Kappa',
	// 		sliceSize:5,
	// 		buffer:true
	// 	},function(err,data){
	// 		expect(err).to.be.null;
	// 		done();
	// 	})
	// });

})
