/**
 * Gulpfile.js by Luke Harvey
 */

'use strict';

/**
 * Include Gulp & tools we'll use
 */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({lazy: true});

var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();

/**
 * Help
 *
 * List the available gulp tasks
 */

gulp.task('help', $.taskListing);

/**
 * Sass
 *
 * Complie and minify the Sass files and auto-inject into browsers
 */

gulp.task('sass', function() {
  log('Processing the main Sass file');

  return gulp.src(['./src/sass/main.scss'])
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 2 versions']}))
    .pipe($.cssnano())
    .pipe($.rename('main.min.css'))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browserSync.stream({match: '**/*.css'}));
});

/**
 * Lint Sass
 *
 * Lint the Sass files using Stylelint
 */

gulp.task('lint-sass', function lintCssTask() {
  log('Linting the Sass files');

  return gulp.src('src/sass/**/*.scss')
    .pipe($.stylelint({
      reporters: [{formatter: 'string', console: true}],
      syntax: "scss"
    }));
});

/**
 * JS
 *
 * Concat and minify the JavaScript files
 */

gulp.task('js', function() {
  log('Processing the JavaScript files');

  return gulp.src(['./src/js/vendor/*.js', './src/js/modules/*.js'])
    .pipe($.sourcemaps.init())
    .pipe($.concat('main.min.js'))
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe($.size({title: 'scripts'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js/'));
});

/**
 * Lint JS
 *
 * Lint the JavaScript files using ESLint
 */

gulp.task('lint-js', function() {
  log('Linting the JavaScript files');

  return gulp.src(['./src/js/modules/*.js'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

/**
 * Lint
 *
 * Lint everything
 */

gulp.task('lint', function(done) {
  runSequence('lint-js', 'lint-sass', done);
});

/**
 * Build
 *
 * Build everything
 */

gulp.task('build', function(done) {
  runSequence('sass', 'js', done);
});

/**
 * Serve
 *
 * Run a Browsersync server and watch all the files.
 */

gulp.task('serve', ['sass', 'js'], function() {

  browserSync.init({
    server: {
      baseDir: "./"
    },
    notify: false
  });

  gulp.watch(['./src/sass/**/*.scss'], ['sass']);
  gulp.watch(['./src/js/**/*.js'], ['js', browserSync.reload]);
  gulp.watch(['./**/*.html']).on('change', browserSync.reload);

});

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */

var log = function(msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
};
