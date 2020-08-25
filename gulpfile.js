var gulp = require("gulp");
var gutil = require("gulp-util");
var concat = require("gulp-concat");
var notify = require("gulp-notify");
var uglify = require("gulp-uglify");
var minify = require('gulp-minify');
//var jshint = require("gulp-jshint");
var sourcemaps = require("gulp-sourcemaps");
//var rename = require("gulp-rename");
const series = require("gulp")
const cleanCSS = require('gulp-clean-css');

gulp.task("vendorjs", function() {
  return gulp
    .src(["bower_components/angular/angular.min.js", 
      "bower_components/angular-route/angular-route.min.js", 
      "bower_components/angular-socialshare/dist/angular-socialshare.min.js", 
      "bower_components/leaflet/dist/leaflet.js", 
      "bower_components/chart.js/dist/Chart.min.js", 
      "bower_components/angular-chart.js/dist/angular-chart.min.js", 
      "bower_components/jquery/dist/jquery.min.js", 
      "bower_components/bootstrap/dist/js/bootstrap.min.js",
      "bower_components/angular-leaflet-directive/angular-leaflet-directive.min.js"
    ])
    .pipe(concat("vendor.js"))
    //.pipe(minify())
    .pipe(gulp.dest("./public/dist/js/"))
});

gulp.task("js", function() {
  return gulp
    .src(["public/stats/**/*.js"])
    .pipe(concat("bundle.js"))
    .pipe(gulp.dest("./public/dist/js/"))
});

gulp.task("vendorcss", function() {
  return gulp
    .src(["public/stats/css/font-awesome.min.css",
        "public/stats/css/rangeInput.min.css",
        "bower_components/bootstrap/dist/css/bootstrap.min.css",
        "bower_components/leaflet/dist/leaflet.css"])
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat("vendor.css"))
    .pipe(gulp.dest("./public/dist/css/"))
})

gulp.task("css", function() {
  return gulp
    .src(["public/stats/css/stats.css"])
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat("bundle.css"))
    .pipe(gulp.dest("./public/dist/css/"))
})

gulp.task("run", gulp.series("vendorjs", "js", "vendorcss", "css"));
