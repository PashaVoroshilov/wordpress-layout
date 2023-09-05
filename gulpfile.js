const gulp = require('gulp')

//for styles
const sass = require('gulp-sass')(require('sass'))
const autoprefixer = require('autoprefixer')
const postcss = require('gulp-postcss')
const groupMediaQuaeries = require('gulp-group-css-media-queries')
const cleanCSS = require('gulp-cleancss')
const ttf2woff = require('gulp-ttf2woff')
const ttf2woff2 = require('gulp-ttf2woff2')

//for scripts
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')

const rename = require('gulp-rename')
const del = require('del')
const plumber = require('gulp-plumber')
const browserSync = require('browser-sync').create()
const svgStore = require('gulp-svgstore')

const themeName = 'twentytwentythree'

const paths = {
	theme: `./dest/wp-content/themes/${themeName}/`,
	themeAssets: `./dest/wp-content/themes/${themeName}/assets/`,
}

function fontsFormat() {
	gulp
		.src(paths.src + 'fonts/*.ttf')
		.pipe(ttf2woff())
		.pipe(gulp.dest(paths.src + 'fonts/'))
	return gulp
		.src(paths.src + 'fonts/*.ttf')
		.pipe(ttf2woff2())
		.pipe(gulp.dest(paths.src + 'fonts/'))
}

function fonts() {
	return gulp
		.src('./src/fonts/**/*.{woff,woff2,eot,ttf,svg,otf}')
		.pipe(gulp.dest(paths.themeAssets + 'fonts/'))
}

function images() {
	return gulp
		.src('./src/img/**/*.{jpg,jpeg,png,gif,svg,json}')
		.pipe(gulp.dest(paths.themeAssets + 'img/'))
}

function styles() {
	return gulp
		.src('./src/scss/main.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(groupMediaQuaeries())
		.pipe(
			postcss([
				autoprefixer({
					browsers: ['last 4 versions'],
					overrideBrowserslist: [
						'defaults',
						'not IE 11',
						'not IE_Mob 11',
						'maintained node versions',
					],
				}),
			])
		)
		.pipe(cleanCSS())
		.pipe(gulp.dest(paths.themeAssets + 'css/'))
}

function stylesLibs() {
	return gulp
		.src('./src/scss/layout/libs/*.css')
		.pipe(concat('vendor.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest(paths.themeAssets + 'css/libs'))
}

function scripts() {
	return gulp
		.src('./src/js/*.js')
		.pipe(plumber())
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(uglify())
		.pipe(gulp.dest(paths.themeAssets + 'js/'))
}

function scriptsLibs() {
	return (
		gulp
			.src('./src/js/libs/*.js')
			// .pipe(uglify())
			.pipe(concat('vendor.js'))
			.pipe(gulp.dest(paths.themeAssets + 'js/libs/'))
	)
}

function spriteSvg() {
	return gulp
		.src('./src/img/icons/sprite/*.svg')
		.pipe(svgStore())
		.pipe(rename({ basename: 'sprite' }))
		.pipe(gulp.dest(paths.themeAssets + 'img/icons/'))
}

function clean() {
	return del(paths.themeAssets)
}

function serve() {
	browserSync.init({
		proxy: `http://mavrikii.loc`,
		host: 'mavrikii.loc',
		port: 8000,
		// open: false,
		// tunnel: true,
		// tunnel: "gulp-wp-fast-start", //Demonstration page: http://gulp-wp-fast-start.localtunnel.me
	})
	browserSync.watch(paths.theme + '**/*.*', browserSync.reload)
}

function watcher() {
	gulp.watch('./src/scss/**/*.scss', styles)
	gulp.watch('./src/scss/**/*.css', stylesLibs)
	gulp.watch('./src/img/**/*.{jpg,jpeg,png,svg,json}', images)
	gulp.watch('./src/js/**/*.js', scripts)
}

exports.fontsFormat = fontsFormat
exports.fonts = fonts
exports.images = images
exports.styles = styles
exports.stylesLibs = stylesLibs
exports.scripts = scripts
exports.scriptsLibs = scriptsLibs
exports.clean = clean
exports.serve = serve
exports.spriteSvg = spriteSvg
exports.watcher = watcher

exports.build = gulp.series(
	clean,
	gulp.parallel(fonts, images, styles, stylesLibs, scripts, scriptsLibs)
)

exports.default = gulp.series(
	clean,
	gulp.parallel(fonts, images, styles, stylesLibs, scripts, scriptsLibs),
	gulp.parallel(watcher, serve)
)
