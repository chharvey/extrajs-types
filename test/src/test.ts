import * as assert from 'assert'


/**
 * The master test function for this project.
 * @see https://nodejs.org/api/assert.html#assert_assert_strictequal_actual_expected_message
 * @param   actual   the actual value to test
 * @param   expected the value that `actual` is expected to be
 * @returns does `assert.strictEqual(actual, expected)` not throw?
 * @throws  {AssertionError} the error from `assert.strictEqual(actual, expected)`
 */
export default async function test(actual: string|Promise<string>, expected: string): Promise<true> {
	assert.strictEqual(await actual, expected, `Got '${await actual}', but was expecting '${expected}'.`)
	return true
}
