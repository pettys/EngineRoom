"use strict";

var gulp = require('gulp');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var less = require('gulp-less');
var notify = require("gulp-notify");
var plumber = require('gulp-plumber');
var uglify = require("gulp-uglify");
var vinylPaths = require('vinyl-paths');

var paths = {
	jsSource: 'obj/**/*.js',
	cssSource: 'src/**/*.less',
	masterLessFile: 'src/style.less',
	dest: 'dest'
};

function reportChange(event) {
	console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task("watch", function () {
	gulp.watch(paths.jsSource, ['build-js']).on('change', reportChange);
	gulp.watch(paths.cssSource, ['build-css']).on('change', reportChange);
});

//gulp.task("clean", function () {
//	var stream = gulp.src([paths.dest])
//		.pipe(vinylPaths(del));
//	return stream;
//});

gulp.task("build-js", function () {
	var stream = gulp.src(paths.jsSource)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(concat('all.js'))
		.pipe(gulp.dest(paths.dest))
		.pipe(notify({ message: "JS Combined", onLast: true }));
	return stream;
});

gulp.task("build-css", function () {
	var stream = gulp.src([paths.masterLessFile])
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(less())
		.pipe(gulp.dest(paths.dest))
		.pipe(notify({ message: "LESS Compiled and Copied", onLast: true }));
	return stream;
});

gulp.task("build-all", ["build-js", "build-css"]);
gulp.task('default', ["build-all", "watch"]);
