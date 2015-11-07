var expect = require('chai').expect;
var async = require('async');
var fs = require('fs');
var imgScramble = require('./');


describe('image-scramble', function() {

	it('should create shuffle image and write', function(done) {
		var outputFile = 'examples/sample5_crop.png'

		this.timeout(10000);
		imgScramble({
			image:'examples/sample5.png',
			seed:'Kappa',
			sliceSize:20,
			dest:outputFile
		},function(err,results){
			expect(fs.readFileSync(outputFile)).to.not.be.null;
			expect(err).to.be.null;
			done();
		});
	});

	it('should create shuffle image and return buffer', function(done) {
		this.timeout(10000);
		imgScramble({
			image:'examples/sample2.png',
			seed:'Kappa',
			sliceSize:5,
			buffer:true
		},function(err,data){
			expect(err).to.be.null;
			done();
		})
	});

})
