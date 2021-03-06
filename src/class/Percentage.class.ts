import * as xjs from 'extrajs'


export default abstract class Percentage {
	/**
	 * An immutable RegExp instance, representing a string in Percentage format.
	 */
	static readonly REGEXP: Readonly<RegExp> = new RegExp(`^${xjs.Number.REGEXP.source.slice(1,-1)}%$`)

	/**
	 * Parse a string matching {@link Percentage.REGEXP}.
	 * @param   str the string to parse
	 * @returns a new Percentage emulating the string
	 * @throws  {RangeError} if the given string does not match `Percentage.REGEXP`
	 */
	static fromString(str: string): number {
		if (!Percentage.REGEXP.test(str)) throw new RangeError(`Invalid string format: '${str}'.`)
		let numeric_part: number = +str.match(xjs.Number.REGEXP.source.slice(1,-1)) ![0]
		return numeric_part / 100
	}

	/**
	 * @deprecated WARNING{DEPRECATED} Use {@link Intl.NumberFormat} instead.
	 * Convert a number to a percentage string.
	 *
	 * The number will be multiplied by the square of the radix,
	 * for example, `toString(0.42)` returns `42%`.
	 * @param   value the value to stringify
	 * @param   radix the base of the numerical value
	 * @returns roughly, `(value * 100).toString() + '%'`
	 */
	static stringify(value: number, radix: number = 10): string {
		console.warn('`Percentage.stringify` is deprecated. Use `Intl.NumberFormat` instead.')
		return `${(radix**2 * value).toString(radix)}%`
	}
}
