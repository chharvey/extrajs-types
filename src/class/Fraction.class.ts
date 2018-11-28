import * as xjs from 'extrajs'

// // TODO: move to xjs.Number
// const xjs_Number_REGEXP: Readonly<RegExp> = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/


/**
 * A fraction of some other value.
 *
 * Represented by a unitless number within the interval `[0, 1]`,
 * where `0` is none of the value and `1` is the whole of the value.
 * Fractions must not exceed beyond this interval.
 */
export default class Fraction extends Number {
	// /**
	//  * An immutable RegExp instance, representing a string in Fraction format.
	//  */
	// static readonly REGEXP: Readonly<RegExp> = new RegExp(`^${xjs_Number_REGEXP.source.slice(1,-1)}%$`)

	/**
	 * Return the maximum of two or more Fractions.
	 * @param   fracs two or more Fractions to compare
	 * @returns the greatest of all the arguments
	 */
	static max(...fracs: Fraction[]): Fraction {
		return new Fraction(Math.max(...fracs.map((p) => p.valueOf())))
		// return fracs.sort((a, b) => (a.lessThan(b)) ? -1 : (b.lessThan(a)) ? 1 : 0).slice(-1)[0]
	}

	/**
	 * Return the minimum of two or more Fractions.
	 * @param   fracs two or more Fractions to compare
	 * @returns the least of all the arguments
	 */
	static min(...fracs: Fraction[]): Fraction {
		return new Fraction(Math.min(...fracs.map((p) => p.valueOf())))
		// return fracs.sort((a, b) => (a.lessThan(b)) ? -1 : (b.lessThan(a)) ? 1 : 0)[0]
	}

	// /**
	//  * Parse a string matching {@link Fraction.REGEXP}.
	//  * @param   str the string to parse
	//  * @returns a new Fraction emulating the string
	//  * @throws  {RangeError} if the given string does not match `Fraction.REGEXP`
	//  */
	// static fromString(str: string): Fraction {
	// 	if (!Fraction.REGEXP.test(str)) throw new RangeError(`Invalid string format: '${str}'.`)
	// 	let numeric_part: number = +str.match(xjs_Number_REGEXP.source.slice(1,-1)) ![0]
	// 	return new Fraction(numeric_part / 100) // NOTE: implies base 10
	// }


	/**
	 * Construct a new Fraction object.
	 * @param   f the numeric value of this Fraction
	 * @throws  {RangeError} if this Fraction is less than 0 or greater than 1
	 */
	constructor(f: Fraction|number = 0) {
		f = f.valueOf()
		xjs.Number.assertType(f, 'finite')
		if (f < 0 || 1 < f) throw new RangeError(`${f} must be between 0 and 1, inclusive.`)
		super(f)
	}

	/**
	 * Get the conjugate of this Fraction.
	 *
	 * The conjugate of a Fraction is the remaining Fraction required
	 * to add to a one full unit (1).
	 * @returns the conjugate of this Fraction
	 */
	get conjugate(): Fraction {
		return new Fraction(1 - this.valueOf())
	}

	// /** @override */
	// toString(radix: number = 10): string {
	// 	return `${(radix**2 * this.valueOf()).toString(radix)}%`
	// }

	/**
	 * Return whether this Fraction’s value equals the argument’s.
	 * @param   frac the Fraction to compare
	 * @returns does this Fraction equal the argument?
	 */
	equals(frac: Fraction|number): boolean {
		return (this === frac) || ((frac instanceof Fraction) ? this.valueOf() === frac.valueOf() : this.equals(new Fraction(frac)))
	}

	/**
	 * Return how this Fraction compares to (is less than) another.
	 * @param   pct  the Fraction to compare
	 * @returns is this Fraction strictly less than the argument?
	 */
	lessThan(pct: Fraction|number): boolean {
		return (pct instanceof Fraction) ? this.valueOf() < pct.valueOf() : this.lessThan(new Fraction(pct))
	}

	/**
	 * Return this Fraction, clamped between two bounds.
	 *
	 * This method returns this unchanged iff it is weakly between `min` and `max`;
	 * it returns `min` iff this is strictly less than `min`;
	 * and `max` iff this is strictly greater than `max`.
	 * If `min === max` then this method returns that value.
	 * If `min > max` then this method switches the bounds.
	 * @param   min the lower bound
	 * @param   max the upper bound
	 * @returns `Fraction.min(Fraction.max(min, this), max)`
	 */
	clamp(min: Fraction|number = 0, max: Fraction|number = 1): Fraction {
		return (min instanceof Fraction && max instanceof Fraction) ?
			(min.lessThan(max) || min.equals(max)) ? Fraction.min(Fraction.max(min, this), max) : this.clamp(max, min) :
			this.clamp(new Fraction(min), new Fraction(max))
	}

	/**
	 * Multiply this Fraction (the multiplicand) by another (the multiplier).
	 * @param   multiplier the Fraction to multiply this one by
	 * @returns a new Fraction representing the product, `multiplicand * multiplier`
	 */
	times(multiplier: Fraction|number = 1): Fraction {
		return (multiplier instanceof Fraction) ?
			new Fraction(this.valueOf() * multiplier.valueOf()) :
			this.times(new Fraction(multiplier))
	}

	/**
	 * Return the argument scaled by this Fraction.
	 * @param   x the value to take this Fraction of
	 * @returns `x`, scaled
	 */
	of(x: number): number {
		return this.valueOf() * x
	}
}
