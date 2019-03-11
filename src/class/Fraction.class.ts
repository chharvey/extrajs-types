import * as xjs from 'extrajs'


/**
 * A fraction of some other value.
 *
 * Represented by a unitless number within the interval `[0, 1]`,
 * where `0` is none of the value and `1` is the whole of the value.
 * Fractions must not exceed beyond this interval.
 *
 * The set of Fractions exhibits the following properties:
 *
 * - Fractions are weakly totally ordered: There exists a weak total order `<=` on the fractions:
 * 	- (Reflexivity) For a fraction `a`, `a <= a`.
 * 	- (Antisymmetry) For fractions `a` and `b`, if `a <= b` and `b <= a`, then `a === b`.
 * 	- (Transitivity) For fractions `a`, `b`, and `c`, if `a <= b` and `b <= c`, then `a <= c`.
 * 	- (Comparability) For distinct fraction `a !== b`, at least one of the following statements is guaranteed true:
 * 		- `a <= b`
 * 		- `b <= a`
 * - Fractions are closed under multiplication:
 * 	For fractions `a` and `b`, the expression `a * b` is guaranteed to also be a fraction.
 * - The set of Fractions has a (unique) multiplicative identity:
 * 	There exists a fraction `1` such that for every fraction `a`,
 * 	`a * 1`, and `1 * a` are guaranteed to equal `a`, and
 * 	`1` is the only fraction with this property.
 * - Fractions have a (unique) multiplicative absorber:
 * 	A unique fraction `0` is guaranteed such that for every fraction `a`, `a * 0 === 0 * a === 0`.
 * - The set of Fractions has no nonzero zero-divisors:
 * 	For fractions `a` and `b`, if `a * b === 0` or if `b * a === 0`, then either `a === 0` or `b === 0`
 * 	(where `0` is the multiplicative absorber).
 * - Multiplication is commutative and associative:
 * 	For fractions `a`, `b`, and `c`, the following statments are guaranteed true:
 * 	- `a * b === b * a`
 * 	- `a * (b * c) === (a * b) * c`
 */
export default class Fraction extends Number {
	/** A zero fraction (the number 0). */
	static readonly ZERO: Fraction = new Fraction(0)
	/** A full fraction (the number 1). */
	static readonly FULL: Fraction = new Fraction(1)

	// /**
	//  * An immutable RegExp instance, representing a string in Fraction format.
	//  */
	// static readonly REGEXP: Readonly<RegExp> = new RegExp(`^${xjs_Number_REGEXP.source.slice(1,-1)}%$`)

	/**
	 * Return the maximum of two or more Fractions.
	 * @param   fracs two or more Fractions to compare
	 * @returns the greatest of all the arguments
	 * @throws  {Error} if no arguments are provided
	 */
	static max(...fracs: Fraction[]): Fraction {
		if (!fracs.length) throw new Error('No arguments provided.')
		return new Fraction(Math.max(...fracs.map((f) => f.valueOf())))
	}

	/**
	 * Return the minimum of two or more Fractions.
	 * @param   fracs two or more Fractions to compare
	 * @returns the least of all the arguments
	 * @throws  {Error} if no arguments are provided
	 */
	static min(...fracs: Fraction[]): Fraction {
		if (!fracs.length) throw new Error('No arguments provided.')
		return new Fraction(Math.min(...fracs.map((f) => f.valueOf())))
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
		return Fraction.FULL.minus(this)
	}

	// /** @override Object */
	// toString(radix: number = 10): string {
	// 	return `${(radix**2 * this.valueOf()).toString(radix)}%`
	// }

	/**
	 * Return whether this Fraction’s value equals the argument’s.
	 * @param   frac the Fraction to compare
	 * @returns does this Fraction equal the argument?
	 */
	equals(frac: Fraction|number): boolean {
		if (this === frac) return true
		return (frac instanceof Fraction) ? this.valueOf() === frac.valueOf() : this.equals(new Fraction(frac))
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
	 * Add this Fraction (the augend) to another (the addend).
	 * @param   addend the Fraction to add to this one
	 * @returns a new Fraction representing the sum, `augend + addend`
	 * @throws  {RangeError} if the result is less than 0
	 * @throws  {RangeError} if the result is greater than 1
	 */
	plus(addend: Fraction|number = 0): Fraction {
		addend = addend.valueOf()
		if (addend === 0) return this
		const returned: number = this.valueOf() + addend
		if (returned < 0) throw new RangeError(`Cannot add ${addend} to ${this.valueOf()}: result is less than 0.`)
		if (1 < returned) throw new RangeError(`Cannot add ${addend} to ${this.valueOf()}: result is greater than 1.`)
		return new Fraction(returned)
	}
	/**
	 * Try {@link Fraction.plus|Fraction#plus}, but return {@link Fraction.FULL} if erring.
	 * @param   addend the Fraction to add to this one
	 * @returns a new Fraction representing the sum, `augend + addend`, clamped at maximum 1
	 */
	plusClamp(addend: Fraction|number = 0): Fraction {
		try { return this.plus(addend) } catch (e) { return Fraction.FULL }
	}

	/**
	 * Subtract another Fraction (the subtrahend) from this (the minuend).
	 *
	 * Note that subtraction is not commutative: `a - b` does not always equal `b - a`.
	 * @param   subtrahend the Fraction to subtract from this one
	 * @returns a new Fraction representing the difference, `minuend - subtrahend`
	 */
	minus(subtrahend: Fraction|number = 0): Fraction {
		return this.plus(-subtrahend)
	}
	/**
	 * Try {@link Fraction.minus|Fraction#minus}, but return {@link Fraction.ZERO} if erring.
	 * @param   subtrahend the Fraction to subtract from this one
	 * @returns a new Fraction representing the difference, `minuend - subtrahend`, clamped at minimum 0
	 */
	minusClamp(subtrahend: Fraction|number = 0): Fraction {
		try { return this.minus(subtrahend) } catch (e) { return Fraction.ZERO }
	}

	/**
	 * Multiply this Fraction (the multiplicand) by another (the multiplier).
	 * @param   multiplier the Fraction to multiply this one by
	 * @returns a new Fraction representing the product, `multiplicand * multiplier`
	 */
	times(multiplier: Fraction|number = 1): Fraction {
		return (multiplier instanceof Fraction) ?
			(multiplier.equals(Fraction.ZERO)) ? Fraction.ZERO :
			(multiplier.equals(Fraction.FULL)) ? this :
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
