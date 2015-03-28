var gulp = require('gulp');
var clean = require('gulp-clean');
var seq = require('run-sequence');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var concatCss = require('gulp-concat-css');
var rename = require('gulp-rename');
var md = require('gulp-markdown-it');
var embrace = require('./src/gulp-plugins/embrace');

gulp.task('clean', function() {
    return gulp.src('build')
        .pipe(clean());
});
gulp.task('build-js', function() {
    return gulp.src('lib/js/*.js')
        .pipe(uglify())
        .pipe(rename('lib/bundle.js'))
        .pipe(gulp.dest('build'));
});
gulp.task('build-css', function() {
    return gulp.src('lib/css/*')
        .pipe(concatCss('lib/bundle.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('build'));
});
gulp.task('build-css-print', function() {
    return gulp.src('lib/css/print/*')
        .pipe(concatCss('lib/bundle-print.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('build'));
});
gulp.task('assets-ico', function() {
    return gulp.src('lib/ico/*')
        .pipe(gulp.dest('build/lib'));
});
gulp.task('assets-img', function() {
    return gulp.src('lib/img/*')
        .pipe(gulp.dest('build/lib'));
});
gulp.task('assets', ['assets-ico', 'assets-img']);
gulp.task('build-md', function() {
    return gulp.src('src/pages/*.md')
        .pipe(md())
        .pipe(embrace({
            layout: 'src/layout.html',
            pathToTileImages: 'lib/',
            imgPath: 'lib/'
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('build', function(cb) {
    seq(
        'clean',
        ['build-js', 'build-css', 'build-css-print', 'build-md', 'assets'],
        cb
    );
});
gulp.task('default', ['build']);