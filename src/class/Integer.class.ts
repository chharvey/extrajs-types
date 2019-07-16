import * as assert from 'assert'

import * as xjs from 'extrajs'


/**
 * An Integer is a whole number, a negative whole number, or 0.
 *
 * The set of Integers exhibits the following properties:
 *
 * - Integers are weakly totally ordered: There exists a weak total order `<=` on the integers:
 * 	- (Reflexivity) For an integer `a`, `a <= a`.
 * 	- (Antisymmetry) For integers `a` and `b`, if `a <= b` and `b <= a`, then `a === b`.
 * 	- (Transitivity) For integers `a`, `b`, and `c`, if `a <= b` and `b <= c`, then `a <= c`.
 * 	- (Comparability) For distinct integers `a !== b`, at least one of the following statements is guaranteed true:
 * 		- `a <= b`
 * 		- `b <= a`
 * - Integers are closed under addition, subtraction, and multiplication:
 * 	For integers `a` and `b`, the expressions `a + b`, `a - b`, and `a * b` are guaranteed to also be integers.
 * - The set of Integers has a (unique) additive identity and a (unique) multiplicative idenity:
 * 	There exist integers `0` and `1` such that for every integer `a`,
 * 	`a + 0`, `0 + a`, `a * 1`, and `1 * a` are guaranteed to equal `a`, and
 * 	`0` and `1`, respectively, are the only integers with this property.
 * - The set of Integers has a (unique) multiplicative absorber:
 * 	A unique integer `0` is guaranteed such that for every integer `a`, `a * 0 === 0 * a === 0`.
 * 	(In general, the multiplicative absorber need not necessarily be the additive identity,
 * 	but in the standard integers we work with daily, they are one in the same.)
 * - The set of Integers has no nonzero zero-divisors:
 * 	For integers `a` and `b`, if `a * b === 0` or if `b * a === 0`, then either `a === 0` or `b === 0`
 * 	(where `0` is the multiplicative absorber).
 * - Integers have (unique) additive inverses:
 * 	For every integer `a`, a unique integer `-a` is guaranteed such that `a + -a === -a + a === 0`
 * 	(where `0` is the additive identity).
 * - Addition and multiplication are commutative and associative:
 * 	For integers `a`, `b`, and `c`, the following statments are guaranteed true:
 * 	- `a + b === b + a`
 * 	- `a * b === b * a`
 * 	- `a + (b + c) === (a + b) + c`
 * 	- `a * (b * c) === (a * b) * c`
 * - Multiplication distributes over addition:
 * 	For integers `a`, `b`, and `c`, we are guaranteed `a * (b + c) === a * b + a * c`.
 */
export default class Integer extends Number {
	/** The additive identity of the group of Integers. */
	static readonly ADD_IDEN: Integer = new Integer()
	/** The multiplicative identity of the group of Integers. */
	static readonly MULT_IDEN: Integer = new Integer(1)
	/** The multiplicative absorber of the group of Integers. */
	static readonly MULT_ABSORB: Integer = new Integer()

	/**
	 * Return the maximum of two or more Integers.
	 * @param   ints two or more Integers to compare
	 * @returns the greatest of all the arguments
	 */
	static max(...ints: Integer[]): Integer {
		return new Integer(Math.max(...ints.map((z) => z.valueOf())))
		// return ints.sort((a, b) => (a.lessThan(b)) ? -1 : (b.lessThan(a)) ? 1 : 0).slice(-1)[0]
	}

	/**
	 * Return the minimum of two or more Integers.
	 * @param   ints two or more Integers to compare
	 * @returns the least of all the arguments
	 */
	static min(...ints: Integer[]): Integer {
		return new Integer(Math.min(...ints.map((z) => z.valueOf())))
		// return ints.sort((a, b) => (a.lessThan(b)) ? -1 : (b.lessThan(a)) ? 1 : 0)[0]
	}


	/**
	 * Construct a new Integer object.
	 * @param   z the numeric value of this Integer
	 */
	constructor(z: Integer|number = 0) {
		z = z.valueOf()
		xjs.Number.assertType(z, 'finite')
		super(Math.trunc(z))
	}

	/**
	 * Return the absolute value of this Integer; `Math.abs(this)`.
	 * @returns `(this < 0) ? -this : this`
	 */
	get abs(): Integer {
		return new Integer(Math.abs(this.valueOf()))
	}

	/**
	 * Get the negation of this Integer.
	 *
	 * The negation of an Integer is its additive inverse:
	 * the Integer that when added to this, gives a sum of 0 (the additive identity).
	 * @returns a new Integer representing the additive inverse
	 */
	get negation(): Integer {
		return new Integer(-this)
	}

	/**
	 * Get the previous Integer, in standard order.
	 * @returns the greatest Integer less than this one
	 */
	get prev(): Integer {
		return this.minus(1)
	}

	/**
	 * Get the next Integer, in standard order.
	 * @returns the least Integer greater than this one
	 */
	get next(): Integer {
		return this.plus(1)
	}

	/**
	 * Verify the type of this Integer, throwing if it does not match.
	 *
	 * Given a "type" argument, test to see if this Integer is of that type.
	 * The acceptable "types", which are not mutually exclusive, follow:
	 *
	 * - `'positive'`     : the integer is strictly greater than 0
	 * - `'negative'`     : the integer is strictly less    than 0
	 * - `'non-positive'` : the integer is less    than or equal to 0
	 * - `'non-negative'` : the integer is greater than or equal to 0
	 * - `'whole'`        : alias of `'positive'`
	 * - `'natural'`      : alias of `'non-negative'`
	 *
	 * If this Integer matches the described type, this method returns `void` instead of `true`.
	 * If it does not match, this method throws an error instead of returning `false`.
	 * This pattern is helpful where an error message is more descriptive than a boolean.
	 *
	 * @param   type one of the string literals listed above
	 * @throws  {AssertionError} if the Integer does not match the described type
	 */
	assertType(type?: 'positive'|'negative'|'non-positive'|'non-negative'|'whole'|'natural'): void {
		if (!type) return;
		return xjs.Object.switch<void>(type, {
			'positive'    : () => assert( Integer.ADD_IDEN.lessThan(this), `${this} must     be a positive integer.`),
			'non-positive': () => assert(!Integer.ADD_IDEN.lessThan(this), `${this} must not be a positive integer.`),
			'negative'    : () => assert( this.lessThan(0)               , `${this} must     be a negative integer.`),
			'non-negative': () => assert(!this.lessThan(0)               , `${this} must not be a negative integer.`),
			'whole'       : () => this.assertType('positive'    ),
			'natural'     : () => this.assertType('non-negative'),
		})()
	}

	/**
	 * Return whether this Integer’s value equals the argument’s.
	 * @param   int the Integer to compare
	 * @returns does this Integer equal the argument?
	 */
	equals(int: Integer|number): boolean {
		if (this === int) return true
		return (int instanceof Integer) ? this.valueOf() === int.valueOf() : this.equals(new Integer(int))
	}

	/**
	 * Return how this Integer compares to (is less than) another.
	 * @param   int the Integer to compare
	 * @returns is this Integer strictly less than the argument?
	 */
	lessThan(int: Integer|number): boolean {
		return (int instanceof Integer) ? this.valueOf() < int.valueOf() : this.lessThan(new Integer(int))
	}

	/**
	 * Return this Integer, clamped between two bounds.
	 *
	 * This method returns this unchanged iff it is weakly between `min` and `max`;
	 * it returns `min` iff this is strictly less than `min`;
	 * and `max` iff this is strictly greater than `max`.
	 * If `min === max` then this method returns that value.
	 * If `min > max` then this method switches the bounds.
	 * @param   min the lower bound
	 * @param   max the upper bound
	 * @returns `Integer.min(Integer.max(min, this), max)`
	 */
	clamp(min: Integer|number, max: Integer|number): Integer {
		return (min instanceof Integer && max instanceof Integer) ?
			(min.lessThan(max) || min.equals(max)) ? Integer.min(Integer.max(min, this), max) : this.clamp(max, min) :
			this.clamp(new Integer(min), new Integer(max))
	}

	/**
	 * @deprecated Use {@link Integer.negation} instead.
	 * @returns `this.negation`
	 */
	negate(): Integer {
		return this.negation
	}

	/**
	 * Add this Integer (the augend) to another (the addend).
	 * @param   addend the Integer to add to this one
	 * @returns a new Integer representing the sum, `augend + addend`
	 */
	plus(addend: Integer|number = 0): Integer {
		return (addend instanceof Integer) ?
			(this  .equals(0)) ? addend :
			(addend.equals(0)) ? this :
			new Integer(this.valueOf() + addend.valueOf()) :
			this.plus(new Integer(addend))
	}

	/**
	 * Subtract another Integer (the subtrahend) from this (the minuend).
	 *
	 * Note that subtraction is not commutative: `a - b` does not always equal `b - a`.
	 * @param   subtrahend the Integer to subtract from this one
	 * @returns a new Integer representing the difference, `minuend - subtrahend`
	 */
	minus(subtrahend: Integer|number = 0): Integer {
		return (subtrahend instanceof Integer) ?
			this.plus(subtrahend.negation) :
			this.minus(new Integer(subtrahend))
	}

	/**
	 * Multiply this Integer (the multiplicand) by another (the multiplier).
	 * @param   multiplier the Integer to multiply this one by
	 * @returns a new Integer representing the product, `multiplicand * multiplier`
	 */
	times(multiplier: Integer|number = 1): Integer {
		return (multiplier instanceof Integer) ?
			(this      .equals(0)) ? this :
			(this      .equals(1)) ? multiplier :
			(multiplier.equals(0)) ? Integer.MULT_ABSORB :
			(multiplier.equals(1)) ? this :
			new Integer(this.valueOf() * multiplier.valueOf()) :
			this.times(new Integer(multiplier))
	}

	/**
	 * Divide this Integer (the dividend) by another number (the divisor).
	 *
	 * Note that division is not commutative: `a / b` does not always equal `b / a`.
	 *
	 * Warning: the result will not be an instance of this `Integer` class,
	 * even if the result happens to be an integer.
	 *
	 * ```
	 * new Integer(6).dividedBy(new Integer(2)) // return the number `3` (an integer)
	 * new Integer(6).dividedBy(new Integer(4)) // return the number `1.5` (not an integer)
	 * new Integer(6).dividedBy(0.5) // return the number `12` (an integer)
	 * ```
	 * @param   divisor the number to divide this one by
	 * @returns a number equal to the quotient, `dividend / divisor`
	 */
	dividedBy(divisor: Integer|number = 1): number {
		const returned = this.valueOf() / divisor.valueOf()
		xjs.Number.assertType(returned)
		return returned
	}

	/**
	 * Exponentiate this Integer (the base) by another number (the exponent).
	 *
	 * Note that exponentiation is not commutative: `a ** b` does not always equal `b ** a`.
	 *
	 * Warning: the result will not be an instance of this `Integer` class,
	 * even if the result happens to be an integer.
	 *
	 * ```
	 * new Integer(2).exp(new Integer(3 )) // return the number `8` (an integer)
	 * new Integer(2).exp(new Integer(-3)) // return the number `0.125` (not an integer)
	 * new Integer(2).exp(0.5) // return `1.4142135623730951` (not an integer)
	 * ```
	 * @param   exponent the number to raise this Integer by
	 * @returns a number equal to the power, `base ** exponent`
	 */
	exp(exponent: Integer|number = 1): number {
		const returned = this.valueOf() ** exponent.valueOf()
		xjs.Number.assertType(returned)
		return returned
	}

	/**
	 * @deprecated WARNING{DEPRECATED} no further development will be made on this method.
	 *
	 * Return the `n`th tetration of this Integer.
	 *
	 * Tetration is considered the next hyperoperation after exponentiation
	 * (which follows multiplication, following addition).
	 * For example, `tetrate(5, 3)` returns the result of `5 ** 5 ** 5`: repeated exponentiation.
	 * (Note that with ambiguous grouping, `a ** b ** c` is equal to `a ** (b ** c)`.)
	 *
	 * If there were a native JavaScript operator for tetration,
	 * it might be a triple-asterisk: `5 *** 3`.
	 *
	 * Note that tetration is not commutative: `a *** b` does not always equal `b *** a`.
	 *
	 * Currently, there is only support for non-negative integer hyperexponents.
	 * Negative numbers and non-integers are not yet allowed.
	 *
	 * ```js
	 * new Integer(5).tetrate(3) // returns 5 ** 5 ** 5 // equal to 5 ** (5 ** 5)
	 * new Integer(5).tetrate(1) // returns 5
	 * new Integer(5).tetrate(0) // returns 1
	 * ```
	 *
	 * @param   hyperexponent the hyper-exponent to which the root is raised, a non-negative integer
	 * @returns `this *** hyperexponent`
	 */
	tetrate(hyperexponent: Integer|number = 1): Integer {
		console.warn('Warning: `Integer#tetrate` is deprecated.')
		return (hyperexponent instanceof Integer) ? (
			xjs.Number.assertType(hyperexponent.valueOf(), 'natural'),
			(hyperexponent.equals(0)) ? Integer.MULT_IDEN :
				new Integer(this.exp(this.tetrate(hyperexponent.minus(1))))
		) : this.tetrate(new Integer(hyperexponent))
	}
}
