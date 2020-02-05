// Gulp Packages
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

// Assets source paths
const SOURCE = {
    scripts: './assets/scripts/',
    styles: './assets/styles/',
    images: './assets/images/',
    blocks: './parts/blocks/',
    php: '**/*.php'
};

// Set local URL if using Browser-Sync
const LOCAL_URL = 'http://stargrid.localhost/';

// SASS options
const SASS_config = {
    options: {
        outputStyle: 'nested',
        // Set this to true to compile SASS code without code.
        // No brackets will be harmed by phasers.
        indentedSyntax: false,
    }
};
 
// Styling tasks
gulp.task('global_styles', function () {
    return gulp.src(SOURCE.styles + 'scss/*.scss')
        .pipe(sass(SASS_config.options).on('error', sass.logError))
        .pipe(gulp.dest(SOURCE.styles));
});

gulp.task('templates_styles', function () {
    return gulp.src(SOURCE.styles + 'scss/templates/*.scss')
    .pipe(sass(SASS_config.options).on('error', sass.logError))
    .pipe(gulp.dest(SOURCE.styles + 'templates'));

});

gulp.task('partials_styles', function () {
    return gulp.src(SOURCE.styles + 'scss/templates/parts/*.scss')
        .pipe(sass(SASS_config.options).on('error', sass.logError))
        .pipe(gulp.dest(SOURCE.styles + 'templates/parts'));
});

gulp.task('block_styles', function () {
    return gulp.src(SOURCE.blocks + '*/*.scss')
        .pipe(sass(SASS_config.options).on('error', sass.logError))
        .pipe(gulp.dest(SOURCE.blocks));
});

// STARGrid styles
gulp.task('stargrid_presets', function () {
    return gulp.src(SOURCE.styles + 'scss/presets/*.scss', SOURCE.styles + 'scss/util/*.scss')
        .pipe(concat('_sg.settings.scss'))
        .pipe(gulp.dest(SOURCE.styles + 'scss'));
});

// Scripts task
gulp.task('scripts', function () {
    return gulp.src(SOURCE.scripts + 'vendors/*.js')
        .pipe(concat('vendors.js'))
        .pipe(uglify())
        .pipe(gulp.dest(SOURCE.scripts));
});

// Image minification task
gulp.task('images', function () {
    return gulp.src(SOURCE.images + 'src/*')
        .pipe(imagemin(
            // JPEG optimization @https://github.com/imagemin/imagemin-jpegtran
            imagemin.jpegtran({progressive: true}),
            // PNG optimization @https://github.com/imagemin/imagemin-optipng
            imagemin.optipng({optimizationLevel: 3}),
            // SVGo optimization @https://github.com/imagemin/imagemin-svgo
            imagemin.svgo({
                plugins: [
                    // Full SVGo plugin list here @https://github.com/svg/svgo#what-it-can-do
                    {removeViewBox: true},
                    {cleanupIDs: false},
                    {removeDesc: false},
                    {minifyStyles: true}
                ]
            })
        ))
        .pipe(gulp.dest(SOURCE.images));
});

// Browser-Sync watch files and inject changes
gulp.task('browsersync', function () {
    // Q will watch these files and tell BrowserSync what to do
    const files = [
        SOURCE.php,
        SOURCE.styles,
        SOURCE.scripts,
    ];
    browserSync.init(files, {
        proxy: LOCAL_URL,
    });
    gulp.watch(SOURCE.styles + 'scss/*.scss', gulp.parallel('global_styles')).on('change', browserSync.reload);
    gulp.watch(SOURCE.styles + 'scss/templates/*.scss', gulp.parallel('templates_styles')).on('change', browserSync.reload);
    gulp.watch(SOURCE.styles + 'scss/templates/parts/*.scss', gulp.parallel('partials_styles')).on('change', browserSync.reload);
    gulp.watch(SOURCE.styles + 'scss/presets/*.scss', gulp.parallel('stargrid_presets')).on('change', browserSync.reload);
    gulp.watch(SOURCE.blocks + '**/*.scss', gulp.parallel('block_styles')).on('change', browserSync.reload);
    gulp.watch(SOURCE.scripts + 'vendors/*.js', gulp.parallel('scripts')).on('change', browserSync.reload);
    // Remove comment if you want BrowserSync to reload on image chages.
    // gulp.watch(SOURCE.images, gulp.parallel('images')).on('change', browserSync.reload);

});

// Watch files for changes (without Browser-Sync)
gulp.task('watch', function () {
    gulp.watch(SOURCE.styles + 'scss/*.scss', gulp.parallel('global_styles'));
    gulp.watch(SOURCE.styles + 'scss/templates/*.scss', gulp.parallel('templates_styles'));
    gulp.watch(SOURCE.styles + 'scss/templates/parts/*.scss', gulp.parallel('partials_styles'));
    gulp.watch(SOURCE.styles + 'scss/presets/*.scss', gulp.parallel('stargrid_presets'));
    gulp.watch(SOURCE.blocks + '**/*.scss', gulp.parallel('block_styles'));
    gulp.watch(SOURCE.scripts + 'vendors/*.js', gulp.parallel('scripts'));
    gulp.watch(SOURCE.images, gulp.parallel('images'));
});

// Default Task
gulp.task('default', gulp.parallel('global_styles', 'stargrid_presets', 'templates_styles', 'partials_styles', 'block_styles', 'scripts', 'images'));