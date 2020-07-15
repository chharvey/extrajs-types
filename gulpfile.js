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

const build = gulp.series(
	dist, // `dist` needs to come before `test` because `src/class/Vector.class.ts` contains a `require()` call
	gulp.parallel(
		test,
		docs,
	),
)

module.exports = {
	build,
		dist,
		test,
		docs,
}
