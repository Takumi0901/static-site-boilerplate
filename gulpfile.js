var gulp = require("gulp");
var sass = require("gulp-sass");
var header = require("gulp-header");
var plumber = require("gulp-plumber");
var ejs = require("gulp-ejs");
var rename = require("gulp-rename");
var fs = require("fs");
var webserver = require("gulp-webserver");
var docs = ".";
var distDir = docs + "/dist";
var srcDir = docs + "/src";
var imagemin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");
var mozjpeg = require("imagemin-mozjpeg");
var changed = require("gulp-changed");
var concat = require("gulp-concat");

var exports = {
  entry: "src/",
  file: "style.scss",
  output: "dist/",
  browsers: ["last 2 version", "iOS >= 8.1", "Android >= 4.4"],
  outputStyle: "expanded"
};

gulp.task("ejs", done => {
  var json = JSON.parse(fs.readFileSync("./src/data/pages.json"));
  gulp
    .src(["src/ejs/**/*.ejs", "!" + "src/ejs/**/_*.ejs"])
    .pipe(plumber())
    .pipe(ejs(json))
    .pipe(rename({ extname: ".html" }))
    .pipe(gulp.dest("dist/"));
  done();
});

gulp.task("sass", done => {
  gulp
    .src(exports.entry + "sass/" + exports.file)
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: exports.outputStyle
      })
    )
    .pipe(header('@charset "utf-8";\n\n'))
    .pipe(gulp.dest(exports.output + "css"));
  done();
});

gulp.task("webserver", function() {
  gulp.src("./dist").pipe(
    webserver({
      livereload: true,
      port: 8001,
      fallback: "index.html",
      open: true
    })
  );
});

gulp.task("images", done => {
  return gulp
    .src(srcDir + "/**/*.{png,jpg,gif,svg}")
    .pipe(changed(distDir)) // src と dist を比較して異なるものだけ処理
    .pipe(
      imagemin([
        pngquant({
          quality: [0.65, 0.8], // 文字列から配列型に変更
          speed: 1
        }),
        mozjpeg({ quality: 80 })
      ])
    )
    .pipe(gulp.dest(distDir)); // 保存
  done();
});

gulp.task("js", function() {
  return gulp
    .src("src/js/*.js")
    .pipe(plumber())
    .pipe(concat("app.js"))
    .pipe(gulp.dest(distDir + "/js"));
});

gulp.task("log", done => {
  console.log("DONE");
  done();
});

gulp.watch("src/js/**/**/*", gulp.series("js", "log"));
gulp.watch("src/sass/**/**/*", gulp.series("sass", "log"));
gulp.watch("src/ejs/**/*.ejs", gulp.series("ejs", "log"));
gulp.watch("src/images/**/*.{png,jpg,gif,svg}", gulp.series("images", "log"));

gulp.task("default", gulp.series("js", "sass", "ejs", "images", "webserver"));
