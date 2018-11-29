// TODO: move to xjs.Number
const xjs_Number_REGEXP: Readonly<RegExp> = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/


/**
 * A fraction of some other value.
 *
 * Represented by a unitless number within the interval `[0, ∞)`, where `1` is the whole of the value.
 *
 * The set of Percentages has the following properties:
 *
 * - Percentages are weakly totally ordered. (There exists a weak total order `<=` on the percentages.)
 * 	- (Reflexivity) For a percentage `a`, `a <= a`.
 * 	- (Antisymmetry) For percentages `a` and `b`, if `a <= b` and `b <= a`, then `a === b`.
 * 	- (Transitivity) For percentages `a`, `b`, and `c`, if `a <= b` and `b <= c`, then `a <= c`.
 * 	- (Comparability) For distinct percentages `a !== b`, at least one of the following statements is guaranteed true:
 * 		- `a <= b`
 * 		- `b <= a`
 * - Percentages are closed under multiplication.
 * 	For percentages `a` and `b`, the expression `a * b` is guaranteed to also be a percentage.
 * - Percentages have a (unique) multiplicative idenity.
 * 	There exists a percentage `1` such that for every percentage `a`,
 * 	`a * 1`, and `1 * a` are guaranteed to equal `a`, and
 * 	`1` is the only percentage with this property.
 * - Percentages have a (unique) multiplicative absorber:
 * 	a unique percentage `0` is guaranteed such that for every percentage `a`, `a * 0 === 0 * a === 0`.
 * - Multiplication is commutative and associative.
 * 	For percentages `a`, `b`, and `c`, the following statments are guaranteed true:
 * 	- `a * b === b * a`
 * 	- `a * (b * c) === (a * b) * c`
 */
export default abstract class Percentage {
	/**
	 * An immutable RegExp instance, representing a string in Percentage format.
	 */
	static readonly REGEXP: Readonly<RegExp> = new RegExp(`^${xjs_Number_REGEXP.source.slice(1,-1)}%$`)

	/**
	 * Parse a string matching {@link Percentage.REGEXP}.
	 * @param   str the string to parse
	 * @returns a new Percentage emulating the string
	 * @throws  {RangeError} if the given string does not match `Percentage.REGEXP`
	 */
	static fromString(str: string): number {
		if (!Percentage.REGEXP.test(str)) throw new RangeError(`Invalid string format: '${str}'.`)
		let numeric_part: number = +str.match(xjs_Number_REGEXP.source.slice(1,-1)) ![0]
		return numeric_part / 100
	}

	/**
	 * Convert a number to a percentage string.
	 *
	 * The number will be multiplied by the square of the radix,
	 * for example, `toString(0.42)` returns `42%`.
	 * @param   value the value to stringify
	 * @param   radix the base of the numerical value
	 * @returns roughly, `(value * 100).toString() + '%'`
	 */
	static stringify(value: number, radix: number = 10): string {
		return `${(radix**2 * value).toString(radix)}%`
	}
}
