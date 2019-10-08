const gulp 				 		 = require('gulp'),
			sass 				 		 = require('gulp-sass'),
			browserSync  		 = require('browser-sync').create(),
			autoprefixer 		 = require('gulp-autoprefixer'),
			useref			 		 = require('gulp-useref'),
			gulpIf       		 = require('gulp-if'),
			cssnano      		 = require('gulp-cssnano'),
			uglify       		 = require('gulp-uglify'),
			imagemin     		 = require('gulp-imagemin'),
			cache        		 = require('gulp-cache'),
			imageminJpegtran = require('imagemin-jpegtran'),
			del					     = require('del'),
			svgSprite 			 = require('gulp-svg-sprite'),
			svgmin 					 = require('gulp-svgmin'),
			cheerio 				 = require('gulp-cheerio'),
			spritesmith			 = require('gulp.spritesmith'),
			replace 				 = require('gulp-replace');

		
// Browsersync initializition

gulp.task('browserSync', function(callback) {

	browserSync.init({
		server: 'app'
	});

	callback();
});

// sass-to-css compilation

gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.sass')
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.stream());
});

// css/js concatenation and minification

gulp.task('concMin', function() {
	return gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulp.dest('dist'))
});

// Images optimizing

gulp.task('images', function() {
	return gulp.src('app/img/**/*.+(png|jpg|gif|svg)')
			 .pipe(cache(imagemin([
				imagemin.gifsicle({interlaced: true}),
				imagemin.jpegtran({progressive: true}),
				imagemin.optipng({optimizationLevel: 5}),
				imagemin.svgo({
					plugins: [
						{removeViewBox: false},
						{cleanupIDs: false}
					]
				})
			])))
		.pipe(gulp.dest('dist/img'))
});

// Making png-sprite

gulp.task('png-sprite', function(callback) {
	let spriteData = gulp.src('app/img/sprite/*.png').pipe(spritesmith({
							imgName: 'png-sprite.png',
							cssName: '_png-sprite.sass',
							imgPath: '../img/sprite/png-sprite.png',
							// retinaSrcFilter: 'app/img/sprite/*2x.png',
							// retinaImgName: '_2xpng-sprite.png',
							// retinaImgPath: '../img/sprite/_2xpng-sprite.png',
							algorithm: 'left-right'
					}));

	spriteData.img.pipe(gulp.dest('app/img/sprite'));
	spriteData.css.pipe(gulp.dest('app/sass/_mixins'));
	callback();
});

// Making svg-sprite

gulp.task('svg-sprite', function () {
	return gulp.src('app/img/sprite/*.svg')
	// minify svg
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		// remove all fill, style and stroke declarations in out shapes
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {xmlMode: true}
		}))
		// cheerio plugin create unnecessary string '&gt;', so replace it.
		.pipe(replace('&gt;', '>'))
		// build svg sprite
		.pipe(svgSprite({
			mode: {
				css: {
				
					render: {
						css: true
					}
						
				}
			}
			}))
		.pipe(gulp.dest('app/img/sprite'));
});

// Making svg <use>

gulp.task('svg-use', function () {
	return gulp.src('app/img/svg-use/*.svg')
	// minify svg
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		// remove all fill, style and stroke declarations in out shapes
		// .pipe(cheerio({
		// 	run: function ($) {
		// 		$('[fill]').removeAttr('fill');
		// 		$('[stroke]').removeAttr('stroke');
		// 		$('[style]').removeAttr('style');
		// 	},
		// 	parserOptions: {xmlMode: true}
		// }))
		// cheerio plugin create unnecessary string '&gt;', so replace it.
		.pipe(replace('&gt;', '>'))
		// build svg sprite
		.pipe(svgSprite({
			mode: {
				symbol: {
							dest:'.'
			}
		}
		}))
		.pipe(gulp.dest('app/img/svg-use'));
});

// Fonts copying in Dist folder

gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'))
});

//  Dist folder deleting

gulp.task('clean', function(callback) {
	del.sync(['dist']);
	callback();
});

// Watching for sass/html changes

gulp.task('default', gulp.parallel('browserSync', 'sass', function(callback) {
	gulp.watch('app/sass/**/*.sass', gulp.parallel('sass'));
	gulp.watch('app/*.html').on('change', browserSync.reload);
	gulp.watch('app/js/**/*.js').on('change', browserSync.reload);
	callback();
}));

// Build task for the production website

gulp.task('build', gulp.series('clean', gulp.parallel('sass', 'concMin', 'images', 'fonts'), function(callback) {
	callback();
}));

// Before 'build' don't forget to 'png/svg-sprite'

	
