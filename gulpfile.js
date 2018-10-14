const gulp  = require('gulp')
const typedoc    = require('gulp-typedoc')
const typescript = require('gulp-typescript')
// require('typedoc')    // DO NOT REMOVE … peerDependency of `gulp-typedoc`
// require('typescript') // DO NOT REMOVE … peerDependency of `gulp-typescript`

const tsconfig      = require('./tsconfig.json')
const typedocconfig = require('./config/typedoc.json')


gulp.task('dist', async function () {
	return gulp.src('./src/**/*.ts')
		.pipe(typescript(tsconfig.compilerOptions))
		.pipe(gulp.dest('./dist/'))
})

gulp.task('test', async function () {
})

gulp.task('docs', async function () {
	return gulp.src('./src/**/*.ts')
		.pipe(typedoc(typedocconfig))
})

gulp.task('build', ['dist', 'test', 'docs'])
