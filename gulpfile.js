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
gulp.task('default', ['help']);

/**
 * Build Sass
 *
 * Complie and minify the Sass files and auto-inject into browsers
 */

gulp.task('build-sass', function() {
  return gulp.src(['./src/sass/main.scss'])
    .pipe($.sourcemaps.init())
      .pipe($.sass({
        precision: 10
      }).on('error', $.sass.logError))
      .pipe($.autoprefixer({browsers: ['last 2 versions']}))
      .pipe($.cssnano())
      .pipe($.rename('main.min.css'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browserSync.stream({match: '**/*.css'}));
});

/**
 * Build JS
 *
 * Concat and minify the JavaScript files
 */

gulp.task('build-js', function() {
  return gulp.src(['./src/js/vendor/*.js', './src/js/modules/*.js'])
    .pipe($.sourcemaps.init())
      .pipe($.concat('main.min.js'))
      .pipe($.uglify({preserveComments: 'some'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js/'));
});

/**
 * Clean
 *
 * Clean the dist assets folder
 */

gulp.task('clean', function () {
  return gulp.src('dist/*', {read: false})
    .pipe($.clean());
});

/**
 * Build
 *
 * Build everything
 */

gulp.task('build', function(done) {
  return runSequence('clean', ['build-sass', 'build-js'], done);
});

/**
 * Lint Sass
 *
 * Lint the Sass files using Stylelint
 */

gulp.task('lint-sass', function lintCssTask() {
  return gulp.src('src/sass/**/*.scss')
    .pipe($.stylelint({
      reporters: [{formatter: 'string', console: true}],
      syntax: "scss"
    }));
});

/**
 * Lint JS
 *
 * Lint the JavaScript files using ESLint
 */

gulp.task('lint-js', function() {
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
  return runSequence('lint-sass', 'lint-js', done);
});

/**
 * Serve
 *
 * Run a Browsersync server and watch all the files.
 */

gulp.task('serve', function() {
  return runSequence('build', function() {
    browserSync.init({
      server: {
        baseDir: "./"
      },
      notify: false
    });

    gulp.watch(['./src/sass/**/*.scss'], ['build-sass']);
    gulp.watch(['./src/js/**/*.js'], ['build-js', browserSync.reload]);
    gulp.watch(['./**/*.html']).on('change', browserSync.reload);
  });
});
