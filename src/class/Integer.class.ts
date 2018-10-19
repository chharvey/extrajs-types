import * as xjs from 'extrajs'


/**
 * An Integer is a whole number, a negative whole number, or 0.
 *
 * The set of Integers has the following properties:
 *
 * - Integers are weakly totally ordered. (There exists a weak total order `<=` on the integers.)
 * 	- (Reflexivity) For an integer `a`, `a <= a`.
 * 	- (Antisymmetry) For integers `a` and `b`, if `a <= b` and `b <= a`, then `a === b`.
 * 	- (Transitivity) For integers `a`, `b`, and `c`, if `a <= b` and `b <= c`, then `a <= c`.
 * 	- (Comparability) For distinct integers `a !== b`, at least one of the following statements is guaranteed true:
 * 		- `a <= b`
 * 		- `b <= a`
 * - Integers are closed under addition, subtraction, and multiplication.
 * 	For integers `a` and `b`, the expressions `a + b`, `a - b`, and `a * b` are guaranteed to also be integers.
 * - Integers have (unique) additive and multiplicative idenities.
 * 	There exist integers `0` and `1` such that for every integer `a`,
 * 	`a + 0`, `0 + a`, `a * 1`, and `1 * a` are guaranteed to equal `a`, and
 * 	`0` and `1`, respectively, are the only integers with this property.
 * - Integers have (unique) additive inverses:
 * 	for every integer `a`, a unique integer `-a` is guaranteed such that `a + -a === -a + a === 0`.
 * - Integers have a (unique) multiplicative absorber:
 * 	a unique integer `0` is guaranteed such that for every integer `a`, `a * 0 === 0 * a === 0`.
 * 	(In general, the multiplicative absorber need not necessarily be the additive identity,
 * 	but in the standard integers we work with daily, they are one in the same.)
 * - Addition and multiplication are commutative and associative.
 * 	For integers `a`, `b`, and `c`, the following statments are guaranteed true:
 * 	- `a + b === b + a`
 * 	- `a * b === b * a`
 * 	- `a + (b + c) === (a + b) + c`
 * 	- `a * (b * c) === (a * b) * c`
 * - Multiplication distributes over addition.
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
	 * Return whether this Integer’s value equals the argument’s.
	 * @param   int the Integer to compare
	 * @returns does this Integer equal the argument?
	 */
	equals(int: Integer|number): boolean {
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
	clamp(min: Integer, max: Integer): Integer {
		return (min.lessThan(max) || min.equals(max)) ? Integer.min(Integer.max(min, this), max) : this.clamp(max, min)
	}

	/**
	 * Negate this Integer.
	 * @returns a new Integer representing the additive inverse
	 */
	negate(): Integer {
		return new Integer(-this.valueOf())
	}

	/**
	 * Add this Integer (the augend) to another (the addend).
	 *
	 * If no argument is provided, this method returns the increment of this Integer (this + 1).
	 * @param   addend the Integer to add to this one
	 * @returns a new Integer representing the sum, `augend + addend`
	 */
	plus(addend: Integer|number = 0): Integer {
		return (addend instanceof Integer) ?
			(addend.equals(Integer.ADD_IDEN)) ? this : new Integer(this.valueOf() + addend.valueOf()) :
			this.plus(new Integer(addend))
	}

	/**
	 * Subtract another Integer (the subtrahend) from this (the minuend).
	 *
	 * If no argument is provided, this method returns the decrement of this Integer (this - 1).
	 *
	 * Note that subtraction is not commutative: `a - b` does not always equal `b - a`.
	 * @param   subtrahend the Integer to subtract from this one
	 * @returns a new Integer representing the difference, `minuend - subtrahend`
	 */
	minus(subtrahend: Integer|number = 0): Integer {
		return (subtrahend instanceof Integer) ?
			this.plus(subtrahend.negate()) :
			this.minus(new Integer(subtrahend))
	}

	/**
	 * Multiply this Integer (the multiplicand) by another (the multiplier).
	 * @param   multiplier the Integer to multiply this one by
	 * @returns a new Integer representing the product, `multiplicand * multiplier`
	 */
	times(multiplier: Integer|number = 1): Integer {
		return (multiplier instanceof Integer) ?
			(multiplier.equals(Integer.MULT_IDEN)) ? this : new Integer(this.valueOf() * multiplier.valueOf()) :
			this.times(new Integer(multiplier))
	}

	/**
	 * Divide this Integer (the dividend) by another (the divisor).
	 *
	 * Warning: the result will not be an instance of this `Integer` class,
	 * even if the result happens to be an integer.
	 *
	 * ```
	 * new Integer(6).dividedBy(new Integer(2)) // return the number `3`
	 * new Integer(6).dividedBy(new Integer(4)) // return the number `1.5`
	 * ```
	 * @param   divisor the Integer to divide this one by
	 * @returns a number equal to the quotient, `dividend / divisor`
	 */
	dividedBy(divisor: Integer|number = 1): number {
		return (divisor instanceof Integer) ?
			this.valueOf() / divisor.valueOf() :
			this.dividedBy(new Integer(divisor))
	}

	/**
	 * Exponentiate this Integer (the base) by another (the exponent).
	 *
	 * Note that exponentiation is not commutative: `a ** b` does not always equal `b ** a`.
	 *
	 * Warning: the result will not be an instance of this `Integer` class,
	 * even if the result happens to be an integer.
	 *
	 * ```
	 * new Integer(2).exp(new Integer(3))  // return the number `8`
	 * new Integer(2).exp(new Integer(-3)) // return the number `0.125`
	 * ```
	 * @param   exponent the other Integer to exponentiate this one by
	 * @returns a number equal to the power, `base ** exponent`
	 */
	exp(exponent: Integer|number = 1): number {
		return (exponent instanceof Integer) ?
			this.valueOf() ** exponent.valueOf() :
			this.exp(new Integer(exponent))
	}
}
