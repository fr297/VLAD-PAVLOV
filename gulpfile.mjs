import gulp from 'gulp';
const { src, dest, series, parallel, watch } = gulp;

import less from 'gulp-less';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import gulpIf from 'gulp-if';
import { deleteAsync } from 'del';
import browserSyncLib from 'browser-sync';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import newer from 'gulp-newer';
import imagemin from 'gulp-imagemin';

const browserSync = browserSyncLib.create();

const paths = {
    html: 'index.html',
    lessEntry: 'less/style.less',
    lessAll: 'less/**/*.less',
    cssOutDev: 'css',
    jsSrc: 'js/**/*.js',
    jsOutDev: 'js',
    fontsSrc: 'fonts/**/*',
    imgSrc: 'img/**/*',
    product: 'product'
};

// ---------- CSS ----------
export function cssDev() {
    return src(paths.lessEntry, { allowEmpty: true })
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.cssOutDev))
        .pipe(browserSync.stream());
}

export function cssBuild() {
    return src(paths.lessEntry, { allowEmpty: true })
        .pipe(plumber())
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(cleanCSS({ level: 2 }))
        .pipe(rename('style.min.css'))
        .pipe(dest(`${paths.product}/css`));
}

// ---------- JS ----------
export function jsDev() {
    return src(paths.jsSrc, { allowEmpty: true })
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.jsOutDev))
        .pipe(browserSync.stream());
}

export function jsBuild() {
    return src(paths.jsSrc, { allowEmpty: true })
        .pipe(plumber())
        .pipe(concat('bundle.min.js'))
        .pipe(terser())
        .pipe(dest(`${paths.product}/js`));
}

// ---------- STATIC ----------
export function htmlBuild() {
    return src(paths.html, { allowEmpty: true }).pipe(dest(paths.product));
}

export function fontsBuild() {
    return src(paths.fontsSrc, { allowEmpty: true })
        .pipe(newer(`${paths.product}/fonts`))
        .pipe(dest(`${paths.product}/fonts`));
}

export function imagesBuild() {
    return src(paths.imgSrc, { allowEmpty: true })
        .pipe(newer(`${paths.product}/img`))
        .pipe(imagemin())
        .pipe(dest(`${paths.product}/img`));
}

// ---------- CLEAN ----------
export function clean() {
    return deleteAsync([paths.product]);
}

// ---------- SERVER ----------
export function serve() {
    browserSync.init({
        server: { baseDir: '.' },
        open: false,
        notify: false
    });

    watch(paths.lessAll, cssDev);
    watch(paths.jsSrc, jsDev);
    watch(paths.html).on('change', browserSync.reload);
    watch('img/**/*').on('change', browserSync.reload);
}

// ---------- COMPOSITES ----------
export const dev = series(parallel(cssDev, jsDev), serve);
export const build = series(
    clean,
    parallel(cssBuild, jsBuild, htmlBuild, fontsBuild, imagesBuild)
);

export default dev;