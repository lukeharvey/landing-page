/**
 * Gulpfile.js by Luke Harvey
 */

"use strict";

const gulp = require("gulp");
const $ = require("gulp-load-plugins")({ lazy: true });
const browserSync = require("browser-sync").create();
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

/**
 * Process Sass
 *
 * Compile and minify the Sass files and auto-inject into browsers
 */

function sass() {
  var plugins = [autoprefixer(), cssnano()];
  return gulp
    .src("./src/sass/main.scss")
    .pipe($.sourcemaps.init())
    .pipe(
      $.sass({
        precision: 10
      }).on("error", $.sass.logError)
    )
    .pipe($.postcss(plugins))
    .pipe($.rename("main.min.css"))
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("./dist/css/"))
    .pipe(browserSync.stream({ match: "**/*.css" }));
}

/**
 * Lint Sass
 *
 * Lint the Sass files using Stylelint
 */

function lintSass(cb) {
  gulp.src("./src/sass/**/*.scss").pipe(
    $.stylelint({
      reporters: [{ formatter: "string", console: true }],
      syntax: "scss"
    })
  );
  cb();
}

/**
 * Process JS
 *
 * Process the JavaScript files
 */

const js = gulp.parallel(jsModules, jsVendor);

function jsModules() {
  return gulp
    .src("./src/js/modules/*.js")
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat("modules.min.js"))
    .pipe($.uglify({ output: { comments: "some" } }))
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("./dist/js/"));
}

function jsVendor() {
  return gulp
    .src("./src/js/vendor/*.js")
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat("vendor.min.js"))
    .pipe($.uglify({ output: { comments: "some" } }))
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest("./dist/js/"));
}

/**
 * Lint JS (modules only)
 *
 * Lint the JavaScript files using ESLint
 */

function lintJS(cb) {
  gulp
    .src("./src/js/modules/*.js")
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
  cb();
}

/**
 * Clean
 *
 * Clean the dist assets folder
 */

function clean() {
  return gulp.src("dist/*", { read: false }).pipe($.clean());
}

/**
 * Reload
 */

function reload(cb) {
  browserSync.reload();
  cb();
}

/**
 * Watch
 */

function watch() {
  gulp.watch("./src/sass/**/*.scss", sass);
  gulp.watch("./src/js/modules/*.js", gulp.series(jsModules, reload));
  gulp.watch("./src/js/vendor/*.js", gulp.series(jsVendor, reload));
  gulp.watch("./**/*.html", reload);
}

/**
 * Serve
 *
 * Run a Browsersync server and watch all the files.
 */

function serve() {
  return browserSync.init({
    injectChanges: true,
    open: false,
    server: {
      baseDir: "./"
    }
  });
}

exports.lint = gulp.parallel(lintSass, lintJS);
exports.build = gulp.series(clean, gulp.parallel(sass, js));
exports.serve = gulp.series(
  gulp.parallel(sass, js),
  gulp.parallel(watch, serve)
);
exports.default = serve;
