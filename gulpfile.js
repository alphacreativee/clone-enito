const { watch, dest, src, series, parallel } = require("gulp"); // Nhập các hàm từ Gulp
const browserSync = require("browser-sync").create(); // Nhập BrowserSync
const rename = require("gulp-rename"); // Nhập plugin đổi tên file
const uglify = require("gulp-uglify"); // Nhập plugin nén JS
const sass = require("gulp-sass")(require("sass")); // Nhập plugin biên dịch SCSS
const cleanCSS = require("gulp-clean-css"); // Nhập plugin nén CSS
const plumber = require("gulp-plumber"); // Nhập plugin xử lý lỗi (không dừng task khi lỗi)

// Task xử lý JavaScript
function js() {
  return src("assets/js/index/*.js", { allowEmpty: true }) // Lấy tất cả file .js trong assets/js
    .pipe(plumber()) // Ngăn task dừng khi có lỗi
    .pipe(uglify()) // Nén file JS
    .pipe(rename({ suffix: ".min" })) // Thêm hậu tố .min
    .pipe(dest("assets/main/js")) // Xuất file đã nén vào assets/main/js
    .pipe(browserSync.stream()); // Reload trình duyệt (dùng stream thay reload)
}

// Task xử lý SCSS - tạo cả file gốc và file minify
function scss() {
  return src("assets/scss/*.scss", { allowEmpty: true }) // Lấy tất cả file .scss trong assets/scss
    .pipe(plumber()) // Ngăn task dừng khi có lỗi
    .pipe(sass().on("error", sass.logError)) // Biên dịch SCSS thành CSS
    .pipe(dest("assets/main/css")) // Xuất file CSS gốc (chưa nén)
    .pipe(cleanCSS()) // Nén file CSS
    .pipe(rename({ suffix: ".min" })) // Thêm hậu tố .min
    .pipe(dest("assets/main/css")) // Xuất file CSS đã nén
    .pipe(browserSync.stream()); // Reload trình duyệt
}

// Task theo dõi file và chạy server
function taskWatch() {
  browserSync.init({
    server: {
      baseDir: "./", // Chạy server từ thư mục gốc
    },
    injectChanges: true, // Chèn thay đổi mà không reload toàn trang
    notify: false, // Tắt thông báo BrowserSync trên trình duyệt
  });
  watch("assets/js/index/*.js", js); // Theo dõi file JS
  watch("assets/scss/*.scss", scss); // Theo dõi file SCSS
  watch("*.html").on("change", browserSync.reload); // Reload khi file HTML thay đổi
}

// Task mặc định
exports.default = series(parallel(js, scss), taskWatch);

// Task riêng lẻ (có thể chạy bằng `gulp js`, `gulp scss`, `gulp libsJs` hoặc `gulp libsCss`)
exports.js = js;
exports.scss = scss;
