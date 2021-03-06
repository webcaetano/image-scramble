'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');

module.exports = function(options) {
	gulp.task('build', function() {
		return gulp.src('unscrambleImg.js')
		.pipe(uglify())
		.pipe(rename(function (path) {
			path.basename += ".min";
		}))
		.pipe(gulp.dest('./'));
	});

	gulp.task('build:release', function(done) {
		runSequence('build','release',done);
	});
};
