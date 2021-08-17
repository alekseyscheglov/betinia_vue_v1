const browsersync = require('browser-sync');
const fileinclude = require('gulp-file-include');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const groupmedia = require('gulp-group-css-media-queries');
const cleancss = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');

let { src, dest } = require('gulp'),
    gulp = require('gulp');

let public_folder = 'public';
let src_folder = '#src';

let path = {
    build: {
        // starthtml: public_folder + '/',
        // html: public_folder + '/components/',
        // pug: public_folder + '/components/',
        pug: public_folder + '/',
        css: public_folder + '/css/',
        js: public_folder + '/js/',
        img: public_folder + '/img/'
    },
    src: {
        // starthtml: [src_folder + '/*.html', '!' + src_folder + '/_*.html'],
        // html: src_folder + '/components/**/*.html',
        // pug: sr_folderc + '/components/**/*.pug',
        pug: src_folder + '/**/*.pug',
        css: src_folder + '/scss/**/*.scss',
        js: src_folder + '/js/main.js',
        img: src_folder + '/img/**/*.{jpg,jpeg,png,ico,svg,gif,webp}'
    },
    watch: {
        // starthtml: src_folder + '/**/*.html',
        // html: src_folder + '/components/**/*.html',
        // pug: src_folder + '/components/**/*.pug',
        pug: src_folder + '/**/*.pug',
        css: src_folder + '/scss/**/*.scss',
        js: src_folder + '/js/**/*.js',
        img: src_folder + '/img/**/*.{jpg,jpeg,png,ico,svg,gif,webp}'
    },
    clean: './' + public_folder + '/'
}

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: './' + public_folder + '/'
        },
        port: 3002,
        notify: false
    });
}

// mainhtml = () => {
//     return src(path.src.starthtml)
//         .pipe(fileinclude())
//         .pipe(dest(path.build.starthtml))
//         .pipe(browsersync.stream())
// }

// componenthtml = () => {
//     return src(path.src.html)
//         .pipe(dest(path.build.html))
//         .pipe(browsersync.stream())
// }

// buildPug = () => {
//     return src(path.src.pug)
//         .pipe(
//             pug({
//                 pretty: true
//             })
//         )
//         .pipe(dest(path.build.html))
//         .pipe(browsersync.stream())
// }

pugBuild = () => {
    return src(path.src.pug)
        .pipe(plumber('pug build error'))
        .pipe(
            pug({
                pretty: true
            })
        )
        .pipe(dest(path.build.pug))
        .pipe(browsersync.stream())
}

css = () => {
    return src(path.src.css)
        .pipe(
           sass({
               outputStyle: 'expanded'
           })
        )
        .pipe(groupmedia())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true
            })
        )
        .pipe(dest(path.build.css))
        .pipe(cleancss())
        .pipe(
            rename({
                extname: '.min.css'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

js = () => {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: '.min.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

images = () => {
    return src(path.src.img)
        .pipe(
            imagemin({
                interlaced: true,
                progressive: true,
                optimizationLevel: 3,
                svgoPlugins: [
                    {
                        removeViewBox: false
                    }
                ]
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

watchFiles = () => {
    // gulp.watch([path.watch.starthtml], mainhtml);
    // gulp.watch([path.watch.html], componenthtml);
    // gulp.watch([path.watch.pug], buildPug);
    gulp.watch([path.watch.pug], pugBuild);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

clean = () => {
    return del(path.clean)
}

// let build = gulp.series(clean, gulp.parallel(images, js, css, buildPug, componenthtml, mainhtml));
let build = gulp.series(clean, gulp.parallel(images, js, css, pugBuild));
let watch = gulp.parallel(build, watchFiles, browserSync)

exports.js = js;
exports.css = css;
exports.pugBuild = pugBuild;
// exports.buildPug = buildPug;
// exports.componenthtml = componenthtml;
// exports.mainhtml = mainhtml;
exports.images = images;
exports.build = build;
exports.watch = watch;
exports.default = watch;