import * as xjs from 'extrajs'

// TODO: move to xjs.Number
const xjs_Number_REGEXP: Readonly<RegExp> = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/


/**
 * A fraction of some other value.
 *
 * Represented by a unitless number within the interval `[0, ∞)`, where `1` is the whole of the value.
 */
export default class Percentage extends Number {
	/**
	 * An immutable RegExp instance, representing a string in Percentage format.
	 */
	static readonly REGEXP: Readonly<RegExp> = new RegExp(`^${xjs_Number_REGEXP.source.slice(1,-1)}%$`)

	/**
	 * Return the maximum of two or more Percentages.
	 * @param   pcts two or more Percentages to compare
	 * @returns the greatest of all the arguments
	 */
	static max(...pcts: Percentage[]): Percentage {
		return new Percentage(Math.max(...pcts.map((p) => p.valueOf())))
		// return pcts.sort((a, b) => (a.lessThan(b)) ? -1 : (b.lessThan(a)) ? 1 : 0).slice(-1)[0]
	}

	/**
	 * Return the minimum of two or more Percentages.
	 * @param   pcts two or more Percentages to compare
	 * @returns the least of all the arguments
	 */
	static min(...pcts: Percentage[]): Percentage {
		return new Percentage(Math.min(...pcts.map((p) => p.valueOf())))
		// return pcts.sort((a, b) => (a.lessThan(b)) ? -1 : (b.lessThan(a)) ? 1 : 0)[0]
	}

	/**
	 * Parse a string matching {@link Percentage.REGEXP}.
	 * @param   str the string to parse
	 * @returns a new Percentage emulating the string
	 * @throws  {RangeError} if the given string does not match `Percentage.REGEXP`
	 */
	static fromString(str: string): Percentage {
		if (!Percentage.REGEXP.test(str)) throw new RangeError(`Invalid string format: '${str}'.`)
		let numeric_part: number = +str.match(xjs_Number_REGEXP.source.slice(1,-1)) ![0]
		return new Percentage(numeric_part / 100) // NOTE: implies base 10
	}


	/**
	 * Construct a new Percentage object.
	 * @param   p the numeric value of this Percentage
	 */
	constructor(p: Percentage|number = 0) {
		p = p.valueOf()
		xjs.Number.assertType(p, 'non-negative')
		xjs.Number.assertType(p, 'finite')
		super(p)
	}

	/**
	 * Get the conjugate of this Percentage.
	 *
	 * The conjugate of a Percentage is the remaining Percentage required
	 * to add to a one full percentage (1, or 100%).
	 *
	 * This method may only be called on percentages less than or equal to 100%.
	 * @returns the conjugate of this Percentage
	 * @throws  {RangeError} if this Percentage is less than 0% or more than 100%
	 */
	get conjugate(): Percentage {
		if (this.valueOf() < 0 || 1 < this.valueOf()) throw new RangeError(`No conjugate exists for ${this.toString()}`)
		return new Percentage(1 - this.valueOf())
	}


	/** @override */
	toString(radix: number = 10): string {
		return `${(radix**2 * this.valueOf()).toString(radix)}%`
	}

	/**
	 * Return whether this Percentage’s value equals the argument’s.
	 * @param   percentage the Percentage to compare
	 * @returns does this Percentage equal the argument?
	 */
	equals(percentage: Percentage|number): boolean {
		return (this === percentage) || ((percentage instanceof Percentage) ? this.valueOf() === percentage.valueOf() : this.equals(new Percentage(percentage)))
	}

	/**
	 * Return how this Percentage compares to (is less than) another.
	 * @param   percentage  the Percentage to compare
	 * @returns is this Percentage strictly less than the argument?
	 */
	lessThan(percentage: Percentage|number): boolean {
		return (percentage instanceof Percentage) ? this.valueOf() < percentage.valueOf() : this.lessThan(new Percentage(percentage))
	}

	/**
	 * Return this Percentage, clamped between two bounds.
	 *
	 * This method returns this unchanged iff it is weakly between `min` and `max`;
	 * it returns `min` iff this is strictly less than `min`;
	 * and `max` iff this is strictly greater than `max`.
	 * If `min === max` then this method returns that value.
	 * If `min > max` then this method switches the bounds.
	 * @param   min the lower bound
	 * @param   max the upper bound
	 * @returns `Percentage.min(Percentage.max(min, this), max)`
	 */
	clamp(min: Percentage|number = 0, max: Percentage|number = 1): Percentage {
		return (min instanceof Percentage && max instanceof Percentage) ?
			(min.lessThan(max) || min.equals(max)) ? Percentage.min(Percentage.max(min, this), max) : this.clamp(max, min) :
			this.clamp(new Percentage(min), new Percentage(max))
	}

	/**
	 * Multiply this Percentage (the multiplicand) by another (the multiplier).
	 * @param   multiplier the Percentage to multiply this one by
	 * @returns a new Percentage representing the product, `multiplicand * multiplier`
	 */
	times(multiplier: Percentage|number = 1): Percentage {
		return (multiplier instanceof Percentage) ?
			new Percentage(this.valueOf() * multiplier.valueOf()) :
			this.times(new Percentage(multiplier))
	}

	/**
	 * Return the argument scaled by this Percentage.
	 * @param   x the value to take this Percentage of
	 * @returns `x`, scaled
	 */
	of(x: number): number {
		return this.valueOf() * x
	}
}
