const pth = require('path');
const fs = require('fs');
const gulp = require('gulp');
const {gutil, del, sass, rollup, tinify, filter, compile, ftp, readFile} = require('../gulp-project');

//清理目录
gulp.task('clean', function (done) {
    del.sync(['js', 'css', 'mobile', 'h5']);
    done();
});

//初始化js
gulp.task('init', function (done) {
    return gulp.src([
        'node_modules/vue/dist/vue.min.js',
        'node_modules/vue-router/dist/vue-router.min.js',
        'node_modules/iscroll/build/iscroll-lite.js',
        'node_modules/blueimp-md5/js/md5.min.js',
        'node_modules/requirejs/require.js',
        'node_modules/video.js/dist/video-js.swf',
        'node_modules/video.js/dist/video.js',
        'node_modules/videojs-contrib-hls/dist/videojs-contrib-hls.js',
        'node_modules/islider.js/build/iSlider.js'])
        .pipe(gulp.dest('js'))
        .on('finish', done);
});

//编译sass文件
gulp.task('sass', function (done) {
    gulp.src(['scss/**/*.scss', '!scss/**/_*.scss'])
        .pipe(sass())
        .pipe(gulp.dest('css'))
        .on('finish', done);
});

//编译js
gulp.task('build.index', function (done) {
    gulp.src('src/index.js')
        .pipe(rollup())
        .pipe(gulp.dest('js'))
        .on('finish', done);
});
gulp.task('build.views', function (done) {
    gulp.src('src/views/*.vue')
        .pipe(rollup({
            generate: {
                format: 'amd'
            }
        }))
        .pipe(gulp.dest('js/views'))
        .on('finish', done);
});

//监听
gulp.task('watch.build', function (done) {
    gulp.watch(['src/**/*.js', '!src/views/**', '!src/components/**'], gulp.parallel('build.index'));
    gulp.watch(['src/views/*.vue'], gulp.parallel('build.views'));
    done();
});

//压缩图片资源
gulp.task('compression', function (done) {
    return gulp.src('images/**/*.{jpg,png}')
        .pipe(tinify())
        .pipe(gutil.noop())
        .on('finish', done);
});

//构建 编译js和css文件
gulp.task('build', gulp.parallel('sass', 'build.index', 'build.views'));

//开发
gulp.task('dev', gulp.series('clean', 'init', 'build', 'watch.build'));

function mkdirsSync(dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
        let pathtmp;
        dirpath.split(pth.sep).forEach(function (dirname) {
            if (pathtmp) {
                pathtmp = pth.join(pathtmp, dirname);
            } else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}

//编译部署到本地目录 /mobile
gulp.task('deploy', function (done) {
    gulp.src(['index.html', 'css/**', 'js/**', 'images/**'])
        .pipe(filter(['src/**']))
        .pipe(compile({
            uri: {
                '**': `/mobile/$0`
            },
            trigger: {
                release: 1,
                env: 1
            }
        }))
        .pipe(readFile(function (files, next) {
            mkdirsSync(pth.join(__dirname, 'mobile'));
            for (let file of files) {
                let path = pth.join(__dirname, `/mobile`, pth.relative(process.cwd(), file.path));
                mkdirsSync(pth.dirname(path));
                fs.writeFileSync(path, file.contents);
            }
            next();
        }))
        // .pipe(gulp.dest('mobile'))
        .on('finish', done);
});

//部署到测试环境fpt
gulp.task('deploy.ftp', function (done) {
    gulp.src(['index.html', 'css/**', 'js/**', 'images/**'])
        .pipe(filter(['src/**']))
        .pipe(compile({
            compression: false,
            uri: {
                '**': `/mobile/$0`
            },
            trigger: {
                release: 1,
                env: 0
            }
        }))
        .pipe(ftp({
            config: {
                "host": '192.168.1.223',
                "port": 21,
                "user": "wenchao",
                "password": "wenchao"
            },
            to: `mobile`
        }))
        .on('finish', done);
});

//发布
gulp.task('release', gulp.series('clean', 'init', 'build', 'deploy'));
gulp.task('release.ftp', gulp.series('clean', 'init', 'build', 'deploy.ftp'));