const gulp  = require('gulp')
const mocha      = require('gulp-mocha')
const typedoc    = require('gulp-typedoc')
const typescript = require('gulp-typescript')
// require('ts-node')    // used by `gulp-mocha` below
// require('typedoc')    // DO NOT REMOVE … peerDependency of `gulp-typedoc`
// require('typescript') // DO NOT REMOVE … peerDependency of `gulp-typescript`

const tsconfig      = require('./tsconfig.json')
const typedocconfig = tsconfig.typedocOptions


function dist() {
	return gulp.src('./src/**/*.ts')
		.pipe(typescript(tsconfig.compilerOptions))
		.pipe(gulp.dest('./dist/'))
}

function test_out() {
	return gulp.src(['./test/src/{,*.}test.ts'])
		.pipe(typescript(tsconfig.compilerOptions))
		.pipe(gulp.dest('./test/out/'))
}

const test_run = gulp.series(
	async function test_run0() {
		console.info('All tests ran successfully!')
	}
)

const test_old = gulp.series(test_out, test_run)

function test() {
	return gulp.src('./test/*.ts')
		.pipe(mocha({
			require: 'ts-node/register',
		}))
}


function docs() {
	return gulp.src('./src/**/*.ts')
		.pipe(typedoc(typedocconfig))
}

const build = gulp.parallel(
	gulp.series(
		gulp.parallel(
			dist,
			test_out
		),
		test_run
	),
	test,
	docs,
)

module.exports = {
	build,
		dist,
		test,
		test_old,
			test_out,
			test_run,
		docs,
}
