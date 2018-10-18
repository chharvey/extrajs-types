import * as xjs from 'extrajs'

// TODO update extrajs@0.15.0+
function xjs_Number_approx(x: number, y: number, epsilon: number = Number.EPSILON): boolean {
	return Math.abs(x - y) < epsilon
}


/**
 * A fraction of some other value.
 *
 * Represented by a unitless number within the interval `[0, ∞)`, where `1` is the whole of the value.
 */
export default class Percentage extends Number {


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


	/** @override */
	toString(radix?: number): string {
		return `${(100 * this.valueOf()).toString(radix)}%`
	}
	/**
	 * Return whether this Percentage’s value equals the argument’s.
	 * @param   percentage the Percentage to compare
	 * @returns does this Percentage equal the argument?
	 */
	equals(percentage: Percentage|number): boolean {
		return (percentage instanceof Percentage) ? this.valueOf() === percentage.valueOf() : this.equals(new Percentage(percentage))
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
