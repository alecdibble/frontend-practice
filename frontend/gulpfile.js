'use strict';

var gulp = require('gulp');
var sequence = require('gulp-sequence');
var del = require ('del');
var gulpUtil = require('gulp-util');
var paths = require('./paths');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var order = require('gulp-order');
var spriteSmith = require('gulp.spritesmith');
var browserSync = require('browser-sync').create();


gulp.task('default', ['dev-build']);
gulp.task('dev', ['dev-build']);


gulp.task('prod-build', sequence('clean', 'sprites', 'assets', 'markup', 'deps', ['prod-styles', 'prod-scripts']));
gulp.task('dev-build', sequence('clean', 'sprites', 'assets', 'markup', 'deps', ['dev-styles', 'dev-scripts']));

gulp.task('watch', function(){

  browserSync.init({
    server: "dist/"
  });

  gulp.watch(paths.sprites.origin, {interval: 250}, ['sprites', 'dev-styles']);
  gulp.watch(paths.images.origin, {interval: 250}, ['assets']);
  gulp.watch(paths.fonts.origin, {interval: 250}, ['assets']);
  gulp.watch(paths.markup.origin, {interval: 250}, ['markup']);
  gulp.watch(paths.deps.origin, {interval: 250}, ['deps']);
  gulp.watch(paths.styles.watch, {interval: 250}, ['dev-styles']);
  gulp.watch(["dist/index.html", "dist/js/*.js", "dist/data/**/*.*", "dist/images/**/*.*"]).on('change', browserSync.reload);
});

gulp.task('clean', function(){
  del(['dist/**/*.*'], {force: true});
});

gulp.task('sprites', function(){

  var stream = gulp.src(paths.sprites.origin)
    .pipe(spriteSmith({
      imgName: 'sprite.png',
      imgPath:  '../images/sprite.png',
      cssName: 'sprite.scss',
      cssTemplate: './gulp/sprite-template.scss.handlebars',
      algorithm: 'binary-tree',
      padding: 4
    }).on('error', gulpUtil.log));

  stream.img.pipe(gulp.dest(paths.sprites.dest.image))
  stream.css.pipe(gulp.dest(paths.sprites.dest.styles))

});

gulp.task('assets', function(){

  gulp.src(paths.images.origin)
    .pipe(gulp.dest(paths.images.dest));

  gulp.src(paths.fonts.origin)
    .pipe(gulp.dest(paths.fonts.dest));

});

gulp.task('markup', function(){

  gulp.src(paths.markup.origin)
    .pipe(gulp.dest(paths.markup.dest));

});

gulp.task('deps', function(){
  gulp.src(paths.deps.origin)
    .pipe(gulp.dest(paths.deps.dest));
});

gulp.task('dev-styles', function(){
  gulp.src(paths.styles.origin)
    .pipe(sass.sync().on('error', gulpUtil.log))
    .pipe(sourcemaps.init())
    .pipe(concat('app.css').on('error', gulpUtil.log))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
});


gulp.task('prod-styles', function(){
  gulp.src(paths.styles.origin)
    .pipe(sass.sync().on('error', gulpUtil.log))
    .pipe(concat('app.css').on('error', gulpUtil.log))
    .pipe(minifyCss().on('error', gulpUtil.log))
    .pipe(gulp.dest(paths.styles.dest))
});



gulp.task('dev-scripts', function(){

  gulp.src(paths.scripts.origin.app)
    .pipe(sourcemaps.init())
    .pipe(concat('app.js').on('error', gulpUtil.log))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scripts.dest));

});

gulp.task('prod-scripts', function(){

  gulp.src(paths.scripts.origin.app)
    .pipe(concat('app.js').on('error', gulpUtil.log))
    .pipe(uglify().on('error', gulpUtil.log))
    .pipe(gulp.dest(paths.scripts.dest));

});
