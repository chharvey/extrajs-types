import * as assert from 'assert'

import * as xjs from 'extrajs'

import Integer from './Integer.class'


/**
 * A rational number is a real number that can be expressed as a ratio of {@link Integer}s.
 *
 * The set of Rationals exhibits the following properties:
 *
 * - Rationals are weakly totally ordered: There exists a weak total order `<=` on the rationals:
 * 	- (Reflexivity) For a rational `a`, `a <= a`.
 * 	- (Antisymmetry) For rationals `a` and `b`, if `a <= b` and `b <= a`, then `a === b`.
 * 	- (Transitivity) For rationals `a`, `b`, and `c`, if `a <= b` and `b <= c`, then `a <= c`.
 * 	- (Comparability) For distinct rationals `a !== b`, at least one of the following statements is guaranteed true:
 * 		- `a <= b`
 * 		- `b <= a`
 * - Rationals are closed under addition, subtraction, multiplication, and division:
 * 	For rationals `a` and `b`, the expressions `a + b`, `a - b`, `a * b`, and `a / b` are guaranteed to also be rationals.
 * - The set of Rationals has a (unique) additive identity and a (unique) multiplicative identity:
 * 	There exist rationals `0` and `1` such that for every rational `a`,
 * 	`a + 0`, `0 + a`, `a * 1`, and `1 * a` are guaranteed to equal `a`, and
 * 	`0` and `1`, respectively, are the only rationals with this property.
 * - The set of Rationals has a (unique) multiplicative absorber:
 * 	A unique rational `0` is guaranteed such that for every rational `a`, `a * 0 === 0 * a === 0`.
 * 	(In general, the multiplicative absorber need not necessarily be the additive identity,
 * 	but in the standard rationals we work with daily, they are one in the same.)
 * - The set of Rationals has no nonzero zero-divisors:
 * 	For rationals `a` and `b`, if `a * b === 0` or if `b * a === 0`, then either `a === 0` or `b === 0`
 * 	(where `0` is the multiplicative absorber).
 * - Rationals have (unique) additive inverses:
 * 	For every rational `a`, a unique rational `-a` is guaranteed such that `a + -a === -a + a === 0`
 * 	(where `0` is the additive identity).
 * - Non-zero Rationals have (unique) multiplicative inverses:
 * 	For every rational `a !== 0` (where `0` is the multiplicative absorber),
 * 	a unique rational `a^` is guaranteed such that `a * a^ === ^a * a === 1`
 * 	(where `1` is the multiplicative identity).
 * - Addition and multiplication are commutative and associative:
 * 	For rationals `a`, `b`, and `c`, the following statements are guaranteed true:
 * 	- `a + b === b + a`
 * 	- `a * b === b * a`
 * 	- `a + (b + c) === (a + b) + c`
 * 	- `a * (b * c) === (a * b) * c`
 * - Multiplication distributes over addition:
 * 	For rationals `a`, `b`, and `c`, we are guaranteed `a * (b + c) === a * b + a * c`.
 */
export default class Rational extends Number {
	/** The additive identity of the group of Rationals. */
	static readonly ADD_IDEN: Rational = new Rational()
	/** The multiplicative identity of the group of Rationals. */
	static readonly MULT_IDEN: Rational = new Rational(1)
	/** The multiplicative absorber of the group of Rationals. */
	static readonly MULT_ABSORB: Rational = new Rational()

	/**
	 * Return the maximum of two or more Rationals.
	 * @param   rats two or more Rationals to compare
	 * @returns the greatest of all the arguments
	 * @throws  {Error} if no arguments are provided
	 */
	static max(...rats: Rational[]): Rational {
		if (!rats.length) throw new Error('No arguments provided.')
		return new Rational(Math.max(...rats.map((z) => z.valueOf())))
	}

	/**
	 * Return the minimum of two or more Rationals.
	 * @param   rats two or more Rationals to compare
	 * @returns the least of all the arguments
	 * @throws  {Error} if no arguments are provided
	 */
	static min(...rats: Rational[]): Rational {
		if (!rats.length) throw new Error('No arguments provided.')
		return new Rational(Math.min(...rats.map((z) => z.valueOf())))
	}


	/** The numerator of this Rational. */
	private readonly _NUMERATOR: Integer;
	/** The denominator of this Rational. */
	private readonly _DENOMINATOR: Integer;

	/**
	 * Construct a new Rational object.
	 * @param   q a Rational object or rational number
	 */
	constructor(q?: Rational|number);
	/**
	 * Construct a new Rational object.
	 * @param   q the numerator of the Rational
	 * @param   r the denominator of the Rational
	 */
	constructor(q?: Integer|number, r?: Integer|number);
	constructor(q: Rational|Integer|number = 0, r: Integer|number = 1) {
		if (q instanceof Rational) {
			;[q, r] = [q._NUMERATOR, q._DENOMINATOR]
		}
		let q_int: Integer|null = (q instanceof Integer) ? q : null
		let r_int: Integer|null = (r instanceof Integer) ? r : null
		q = q.valueOf()
		r = r.valueOf()
		xjs.Number.assertType(q, 'finite')
		xjs.Number.assertType(r, 'finite')
		xjs.Number.assertType(r, 'non-zero')
		q_int = q_int || new Integer(q * 1e16)
		r_int = r_int || new Integer(r * 1e16)
		super(q_int.valueOf() / r_int.valueOf())
		this._NUMERATOR   = q_int
		this._DENOMINATOR = r_int
	}

	/**
	 * Return the absolute value of this Rational; `Math.abs(this)`.
	 * @returns `(this < 0) ? -this : this`
	 */
	get abs(): Rational {
		return new Rational(Math.abs(this.valueOf()))
	}

	/**
	 * Get the negation of this Rational.
	 *
	 * The negation of an Rational is its additive inverse:
	 * the Rational that when added to this, gives a sum of 0 (the additive identity).
	 * @returns a new Rational representing the additive inverse
	 */
	get negation(): Rational {
		return new Rational(-this._NUMERATOR, this._DENOMINATOR)
	}

	/**
	 * Get the reciprocal of this Rational.
	 *
	 * The reciprocal of an Rational is its multiplicative inverse:
	 * the Rational that when multiplied by this, gives a product of 1 (the multiplicative identity).
	 * @returns a new Rational representing the additive inverse
	 */
	get reciprocal(): Rational {
		if (this.equals(0)) throw new RangeError('0 does not have a reciprocal.')
		return new Rational(this._DENOMINATOR, this._NUMERATOR)
	}

	/**
	 * Verify the type of this Rational, throwing if it does not match.
	 *
	 * Given a "type" argument, test to see if this Rational is of that type.
	 * The acceptable "types", which are not mutually exclusive, follow:
	 *
	 * - `'positive'`     : the rational is strictly greater than 0
	 * - `'negative'`     : the rational is strictly less    than 0
	 * - `'non-positive'` : the rational is less    than or equal to 0
	 * - `'non-negative'` : the rational is greater than or equal to 0
	 *
	 * If this Integer matches the described type, this method returns `void` instead of `true`.
	 * If it does not match, this method throws an error instead of returning `false`.
	 * This pattern is helpful where an error message is more descriptive than a boolean.
	 *
	 * @param   type one of the string literals listed above
	 * @throws  {AssertionError} if the Rational does not match the described type
	 */
	assertType(type?: 'positive'|'negative'|'non-positive'|'non-negative'): void {
		if (!type) return;
		return (new Map([
			['positive'    , () => assert( Rational.ADD_IDEN.lessThan(this), `${this} must     be a positive integer.`)],
			['non-positive', () => assert(!Rational.ADD_IDEN.lessThan(this), `${this} must not be a positive integer.`)],
			['negative'    , () => assert( this.lessThan(0)                , `${this} must     be a negative integer.`)],
			['non-negative', () => assert(!this.lessThan(0)                , `${this} must not be a negative integer.`)],
		]).get(type) || (() => { throw new Error('No argument was given.') }))()
	}

	/**
	 * Return whether this Rational’s value equals the argument’s.
	 * @param   rat the Rational to compare
	 * @returns does this Rational equal the argument?
	 */
	equals(rat: Rational|number): boolean {
		if (this === rat) return true
		return (rat instanceof Rational) ?
			this._NUMERATOR.times(rat._DENOMINATOR).equals(rat._NUMERATOR.times(this._DENOMINATOR)) :
			this.equals(new Rational(rat))
	}

	/**
	 * Return how this Rational compares to (is less than) another.
	 * @param   rat the Rational to compare
	 * @returns is this Rational strictly less than the argument?
	 */
	lessThan(rat: Rational|number): boolean {
		return (rat instanceof Rational) ? this.valueOf() < rat.valueOf() : this.lessThan(new Rational(rat))
	}

	/**
	 * Return this Rational, clamped between two bounds.
	 *
	 * This method returns this unchanged iff it is weakly between `min` and `max`;
	 * it returns `min` iff this is strictly less than `min`;
	 * and `max` iff this is strictly greater than `max`.
	 * If `min === max` then this method returns that value.
	 * If `min > max` then this method switches the bounds.
	 * @param   min the lower bound
	 * @param   max the upper bound
	 * @returns `Rational.min(Rational.max(min, this), max)`
	 */
	clamp(min: Rational|number, max: Rational|number): Rational {
		return (min instanceof Rational && max instanceof Rational) ?
			(min.lessThan(max) || min.equals(max)) ? Rational.min(Rational.max(min, this), max) : this.clamp(max, min) :
			this.clamp(new Rational(min), new Rational(max))
	}

	/**
	 * Add this Rational (the augend) to another (the addend).
	 * @param   addend the Rational to add to this one
	 * @returns a new Rational representing the sum, `augend + addend`
	 */
	plus(addend: Rational|number = 0): Rational {
		/*
		 * (a/b) + (c/d)
		 * == (ad/bd) + (cb/db)
		 * == (ad + cb) / (bd)
		 */
		return (addend instanceof Rational) ?
			(this  .equals(0)) ? addend :
			(addend.equals(0)) ? this :
			new Rational(
				this._NUMERATOR.times(addend._DENOMINATOR).plus(addend._NUMERATOR.times(this._DENOMINATOR)),
				this._DENOMINATOR.times(addend._DENOMINATOR),
			) :
			this.plus(new Rational(addend))
	}

	/**
	 * Subtract another Rational (the subtrahend) from this (the minuend).
	 *
	 * Note that subtraction is not commutative: `a - b` does not always equal `b - a`.
	 * @param   subtrahend the Rational to subtract from this one
	 * @returns a new Rational representing the difference, `minuend - subtrahend`
	 */
	minus(subtrahend: Rational|number = 0): Rational {
		return (subtrahend instanceof Rational) ?
			this.plus(subtrahend.negation) :
			this.minus(new Rational(subtrahend))
	}

	/**
	 * Multiply this Rational (the multiplicand) by another (the multiplier).
	 * @param   multiplier the Rational to multiply this one by
	 * @returns a new Rational representing the product, `multiplicand * multiplier`
	 */
	times(multiplier: Rational|number = 1): Rational {
		/*
		 * (a/b) * (c/d)
		 * == (ac / bd)
		 */
		return (multiplier instanceof Rational) ?
			(this      .equals(0)) ? this :
			(this      .equals(1)) ? multiplier :
			(multiplier.equals(0)) ? Rational.MULT_ABSORB :
			(multiplier.equals(1)) ? this :
			new Rational(
				this._NUMERATOR.times(multiplier._NUMERATOR),
				this._DENOMINATOR.times(multiplier._DENOMINATOR),
			) :
			this.times(new Rational(multiplier))
	}

	/**
	 * Divide this Rational (the dividend) by another (the divisor).
	 *
	 * Note that division is not commutative: `a / b` does not always equal `b / a`.
	 * @param   divisor the Rational to divide this one by
	 * @returns a new Rational representing the quotient, `dividend / divisor`
	 */
	dividedBy(divisor: Rational|number = 1): Rational {
		return (divisor instanceof Rational) ?
			this.times(divisor.reciprocal) :
			this.dividedBy(new Rational(divisor))
	}

	/**
	 * Exponentiate this Rational (the base) by another number (the exponent).
	 *
	 * Note that exponentiation is not commutative: `a ** b` does not always equal `b ** a`.
	 *
	 * Warning: the result will not be an instance of this `Rational` class,
	 * even if the result happens to be a rational number.
	 *
	 * ```
	 * new Rational(1/2).exp(new Rational(3  )) // return the number `0.125` (a rational number)
	 * new Rational(1/2).exp(new Rational(1/3)) // return the number `0.7937005259840998` (not a rational number)
	 * new Rational(2).exp(3) // return the number `8` (a rational number)
	 * ```
	 * @param   exponent the other Rational to exponentiate this one by
	 * @returns a number equal to the power, `base ** exponent`
	 */
	exp(exponent: Rational|number = 1): number {
		/*
		 * (a/b) ** x
		 * == (a ** x / b ** x)
		 */
		const returned: number = this._NUMERATOR.exp(exponent.valueOf()) / this._DENOMINATOR.exp(exponent.valueOf())
		xjs.Number.assertType(returned)
		return returned
	}
}
