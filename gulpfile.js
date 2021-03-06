var gulp = require("gulp");
var sass = require("gulp-sass");
var header = require("gulp-header");
var plumber = require("gulp-plumber");
var ejs = require("gulp-ejs");
var rename = require("gulp-rename");
var fs = require("fs");
var docs = ".";
var distDir = docs + "/dist";
var srcDir = docs + "/src";
var imagemin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");
var mozjpeg = require("imagemin-mozjpeg");
var changed = require("gulp-changed");
var concat = require("gulp-concat");
var prefix = require("gulp-autoprefixer");
var connect = require("gulp-connect");
var sitemap = require("gulp-sitemap");

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
    .pipe(gulp.dest("dist/"))
    .pipe(connect.reload());
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
    .pipe(
      prefix({
        browsers: ["last 2 versions", "ie >= 11", "Android >= 4", "ios_saf >= 8"],
        cascade: false,
        grid: true
      })
    )
    .pipe(header('@charset "utf-8";\n\n'))
    .pipe(gulp.dest(exports.output + "css"))
    .pipe(connect.reload());
  done();
});

gulp.task("connect", function() {
  connect.server({
    root: "./dist",
    livereload: true,
    port: 3000
  });
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
        mozjpeg()
      ])
    )
    .pipe(gulp.dest(distDir))
    .pipe(connect.reload()); // 保存
  done();
});

gulp.task("js", function() {
  return gulp
    .src("src/js/*.js")
    .pipe(plumber())
    .pipe(concat("app.js"))
    .pipe(gulp.dest(distDir + "/js"))
    .pipe(connect.reload());
});

gulp.task("sitemap", function() {
  return gulp
    .src("dist/**/*.html", {
      read: false
    })
    .pipe(
      sitemap({
        siteUrl: "https://example.com/"
      })
    )
    .pipe(gulp.dest("./dist"));
});

gulp.task("log", done => {
  console.log("DONE");
  done();
});

function watchFiles(done) {
  gulp.watch("src/js/**/**/*", gulp.series("js", "log"));
  gulp.watch("src/sass/**/**/*", gulp.series("sass", "log"));
  gulp.watch("src/ejs/**/*.ejs", gulp.series("ejs", "log"));
  gulp.watch("src/images/**/*.{png,jpg,gif,svg}", gulp.series("images", "log"));
  done();
}

gulp.task("default", gulp.series(watchFiles, "connect"));
gulp.task("build", gulp.series("js", "sass", "ejs", "images", "sitemap"));
