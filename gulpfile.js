const gulp  = require('gulp')
const typedoc    = require('gulp-typedoc')
const typescript = require('gulp-typescript')
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

async function test_run_angle() {
	await Promise.all([
		require('./test/out/Angle-constructor.test.js').default,
	])
	console.info('All _Angle_ tests ran successfully!')
}

async function test_run_color() {
	await Promise.all([
		require('./test/out/Color--fromString.test.js').default,
		require('./test/out/Color--random.test.js').default,
		require('./test/out/Color--randomName.test.js').default,
		require('./test/out/Color-constructor.test.js').default,
		require('./test/out/Color-toString.test.js').default,
		require('./test/out/Color-invert.test.js').default,
		require('./test/out/Color-rotate.test.js').default,
		require('./test/out/Color-complement.test.js').default,
		require('./test/out/Color-name.test.js').default,
	])
	console.info('All _Color_ tests ran successfully!')
}

async function test_run_length() {
	await Promise.all([
		require('./test/out/Length-constructor.test.js').default,
	])
	console.info('All _Length_ tests ran successfully!')
}

async function test_run_treenode() {
	await Promise.all([
		require('./test/out/TreeNodePre-constructor.test.js').default,
		require('./test/out/TreeNodePre-path.test.js').default,
	])
	console.info('All _TreeNode_ tests ran successfully!')
}

async function test_run_vector() {
	await Promise.all([
		require('./test/out/Vector-constructor.test.js').default,
		require('./test/out/Vector-cross.test.js').default,
	])
	console.info('All _Vector_ tests ran successfully!')
}

const test_run = gulp.series(
	gulp.parallel(
		test_run_angle,
		test_run_color,
		test_run_length,
		test_run_treenode,
		test_run_vector,
	), async function test_run0() {
		console.info('All tests ran successfully!')
	}
)

const test = gulp.series(test_out, test_run)

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
	docs
)

module.exports = {
	build,
		dist,
		test,
			test_out,
			test_run,
				test_run_angle,
				test_run_color,
				test_run_length,
				test_run_treenode,
				test_run_vector,
		docs,
}
