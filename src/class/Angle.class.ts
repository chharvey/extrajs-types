import * as xjs from 'extrajs'

import Percentage from './Percentage.class'


/**
 * A list of possible Angle units.
 * @see https://www.w3.org/TR/css-values/#angles
 */
export enum AngleUnit {
	/** Degrees. There are 360 degrees in a full circle. */
	DEG,
	/** Gradians, also known as "gons" or "grades". There are 400 gradians in a full circle. */
	GRAD,
	/** Radians. There are 2π radians in a full circle. */
	RAD,
	/** Turns. There is 1 turn in a full circle. */
	TURN,
}


/**
 * A one-dimensional angular measurement.
 *
 * In geometry, an angle is a pair of rays that share a vertex.
 * This class encodes the measurement of such a figure.
 * An Angle is represented by a unitless number within the interval `[0, 1)`,
 * but can manifest in units such as *degrees*, *radians*, and *turns*.
 * Angles can also be added, subtracted, and scaled.
 */
export default class Angle extends Number {
	/**
	 * A zero angle.
	 *
	 * A zero angle measures 0turn (0deg, 0grad, 0rad).
	 */
	static readonly ZERO: Angle = new Angle(0)
	/**
	 * A right angle.
	 *
	 * A right angle measures 0.25turn (90deg, 100grad, (π/2)rad).
	 */
	static readonly RIGHT: Angle = new Angle(0.25)
	/**
	 * A straight angle.
	 *
	 * A straight angle measures 0.5turn (180deg, 200grad, (π)rad).
	 */
	static readonly STRAIGHT: Angle = new Angle(0.5)
	/**
	 * A full angle (a full circle).
	 *
	 * A full angle measures 1turn (360deg, 400grad, (2π)rad).
	 *
	 * Note: A full angle is equivalent to a {@link Angle.ZERO|zero angle},
	 * and thus will be considered {@link Angle.lessThan|less than} any other non-zero angle.
	 */
	static readonly FULL: Angle = new Angle(1)

	/**
	 * A dictionary of conversion rates.
	 *
	 * The value assigned to each unit is the number of units in one full circle.
	 */
	static readonly CONVERSION: { readonly [index in AngleUnit]: number } = {
		[AngleUnit.DEG ]: 360,
		[AngleUnit.GRAD]: 400,
		[AngleUnit.RAD ]: 2 * Math.PI,
		[AngleUnit.TURN]: 1,
	}

	/**
	 * Return the maximum of two or more Angles.
	 * @param   angles two or more Angles to compare
	 * @returns the greatest of all the arguments
	 */
	static max(...angles: Angle[]): Angle {
		return new Angle(Math.max(...angles.map((theta) => theta.valueOf())))
		// return angles.sort((a, b) => (a.lessThan(b)) ? -1 : (b.lessThan(a)) ? 1 : 0).slice(-1)[0]
	}

	/**
	 * Return the minimum of two or more Angles.
	 * @param   angles two or more Angles to compare
	 * @returns the least of all the arguments
	 */
	static min(...angles: Angle[]): Angle {
		return new Angle(Math.min(...angles.map((theta) => theta.valueOf())))
		// return angles.sort((a, b) => (a.lessThan(b)) ? -1 : (b.lessThan(a)) ? 1 : 0)[0]
	}

	/**
	 * Return the arcsine of a number.
	 * @param   x the argument of arcsin
	 * @returns `arcsin(x)`
	 * @throws {RangeError} if the argument is not within the domain `[-1,1]`
	 */
	static asin(x: number): Angle {
		xjs.Number.assertType(x)
		if (x < -1 || 1 < x) throw new RangeError(`Argument ${x} is outside of \`asin\` domain \`[-1,1]\`.`)
		return new Angle(Math.asin(x) / Angle.CONVERSION[AngleUnit.RAD])
	}

	/**
	 * Return the arccosine of a number.
	 * @param   x the argument of arccos
	 * @returns `arccos(x)`
	 * @throws {RangeError} if the argument is not within the domain `[-1,1]`
	 */
	static acos(x: number): Angle {
		xjs.Number.assertType(x)
		if (x < -1 || 1 < x) throw new RangeError(`Argument ${x} is outside of \`acos\` domain \`[-1,1]\`.`)
		return new Angle(Math.acos(x) / Angle.CONVERSION[AngleUnit.RAD])
	}

	/**
	 * Return the arctangent of a number.
	 * @param   x the argument of arctan
	 * @returns `arctan(x)`
	 */
	static atan(x: number): Angle {
		xjs.Number.assertType(x)
		return new Angle(Math.atan(x) / Angle.CONVERSION[AngleUnit.RAD])
	}

	/**
	 * Return the arccosecant of a number.
	 * @param   x the argument of arccsc
	 * @returns `arcsin(1 / x)`
	 */
	static acsc(x: number): Angle {
		return Angle.asin(1 / x)
	}

	/**
	 * Return the arcsecant of a number.
	 * @param   x the argument of arcsec
	 * @returns `arccos(1 / x)`
	 */
	static asec(x: number): Angle {
		return Angle.acos(1 / x)
	}

	/**
	 * Return the arccotangent of a number.
	 * @param   x the argument of arccot
	 * @returns `arctan(1 / x)`
	 */
	static acot(x: number): Angle {
		return Angle.atan(1 / x)
	}

	/**
	 * Parse a string of the form `'‹n›‹u›'`, where `‹n›` is a number and `‹u›` is an angle unit.
	 * @param   str the string to parse
	 * @returns a new Angle emulating the string
	 * @throws  {RangeError} if the string given is not of the correct format
	 */
	static fromString(str: string): Angle {
		if (str.slice(-3) === 'deg' ) return new Angle(+str.slice(0, -3) / Angle.CONVERSION[AngleUnit.DEG ])
		if (str.slice(-4) === 'grad') return new Angle(+str.slice(0, -4) / Angle.CONVERSION[AngleUnit.GRAD])
		if (str.slice(-3) === 'rad' ) return new Angle(+str.slice(0, -3) / Angle.CONVERSION[AngleUnit.RAD ])
		if (str.slice(-4) === 'turn') return new Angle(+str.slice(0, -4) / Angle.CONVERSION[AngleUnit.TURN])
		throw new RangeError(`Invalid string format: '${str}'.`)
	}


	/**
	 * Construct a new Angle object.
	 * @param   theta the numeric value of this Angle
	 */
	constructor(theta: Angle|number = 0) {
		theta = theta.valueOf()
		super(xjs.Math.mod(theta, 1))
	}

	/**
	 * Get the complement of this Angle.
	 *
	 * Complementary angles add to form a right angle (0.25turn).
	 * @returns the complement of this Angle
	 */
	get complement(): Angle {
		return Angle.RIGHT.minus(this)
	}

	/**
	 * Get the supplement of this Angle.
	 *
	 * Supplementary angles add to form a straight angle (0.5turn).
	 * @returns the supplement of this Angle
	 */
	get supplement(): Angle {
		return Angle.STRAIGHT.minus(this)
	}

	/**
	 * Get the conjugate of this Angle.
	 *
	 * Conjugate angles add to form a full angle (1turn).
	 * The conjugate of an angle is equivalent to its “negation”.
	 * @returns the conjugate of this Angle
	 */
	get conjugate(): Angle {
		return Angle.FULL.minus(this)
	}

	/**
	 * Get the inversion of this Angle.
	 * @returns this angle rotated by 0.5turn
	 */
	get invert(): Angle {
		return this.plus(Angle.STRAIGHT)
	}

	/**
	 * Return whether this Angle is acute.
	 * @returns is the measure of this Angle less than 0.25turn?
	 */
	get isAcute(): boolean {
		return this.lessThan(Angle.RIGHT)
	}

	/**
	 * Return whether this Angle is obtuse.
	 * @returns is the measure of this Angle between 0.25turn and 0.5turn?
	 */
	get isObtuse(): boolean {
		return Angle.RIGHT.lessThan(this) && this.lessThan(Angle.STRAIGHT)
	}

	/**
	 * Return whether this Angle is reflex.
	 * @returns is the measure of this Angle greater than 0.5turn?
	 */
	get isReflex(): boolean {
		return Angle.STRAIGHT.lessThan(this)
	}

	/**
	 * Get the sine of this angle.
	 * @returns `sin(this)`
	 */
	get sin(): number {
		return Math.sin(this.convert(AngleUnit.RAD))
	}

	/**
	 * Get the cosine of this angle.
	 * @returns `cos(this)`
	 */
	get cos(): number {
		return Math.cos(this.convert(AngleUnit.RAD))
	}

	/**
	 * Get the tangent of this angle.
	 * @returns `tan(this)`
	 */
	get tan(): number {
		return Math.tan(this.convert(AngleUnit.RAD))
	}

	/**
	 * Get the cosecant of this angle.
	 * @returns `1 / sin(this)`
	 */
	get csc(): number {
		return 1 / this.sin
	}

	/**
	 * Get the secant of this angle.
	 * @returns `1 / cos(this)`
	 */
	get sec(): number {
		return 1 / this.cos
	}

	/**
	 * Get the cotangent of this angle.
	 * @returns `1 / tan(this)`
	 */
	get cot(): number {
		return 1 / this.tan
	}

	/** @override */
	toString(radix?: number, unit?: AngleUnit): string {
		return (unit) ?
			`${this.convert(unit).toString(radix)}${AngleUnit[unit].toLowerCase()}` :
			super.toString(radix)
	}

	/**
	 * Return whether this Angle’s value equals the argument’s.
	 * @param   angle the Angle to compare
	 * @returns does this Angle equal the argument?
	 */
	equals(angle: Angle|number): boolean {
		return (this === angle) || ((angle instanceof Angle) ? xjs.Math.approx(this.valueOf(), angle.valueOf()) : this.equals(new Angle(angle)))
	}

	/**
	 * Return how this Angle compares to (is less than) another.
	 * @param   angle the Angle to compare
	 * @returns is this Angle strictly less than the argument?
	 */
	lessThan(angle: Angle|number): boolean {
		if (this.equals(angle)) return false // accommodate for approximations
		return (angle instanceof Angle) ? this.valueOf() < angle.valueOf() : this.lessThan(new Angle(angle))
	}

	/**
	 * Return this Angle, clamped between two bounds.
	 *
	 * This method returns this unchanged iff it is weakly between `min` and `max`;
	 * it returns `min` iff this is strictly less than `min`;
	 * and `max` iff this is strictly greater than `max`.
	 * If `min === max` then this method returns that value.
	 * If `min > max` then this method switches the bounds.
	 * @param   min the lower bound
	 * @param   max the upper bound
	 * @returns `Angle.min(Angle.max(min, this), max)`
	 */
	clamp(min: Angle|number = 0, max: Angle|number = 1): Angle {
		return (min instanceof Angle && max instanceof Angle) ?
			(min.lessThan(max) || min.equals(max)) ? Angle.min(Angle.max(min, this), max) : this.clamp(max, min) :
			this.clamp(new Angle(min), new Angle(max))
	}

	/**
	 * Add this Angle (the augend) to another (the addend).
	 * @param   addend the Angle to add to this one
	 * @returns a new Angle representing the sum, `augend + addend`
	 */
	plus(addend: Angle|number): Angle {
		return (addend instanceof Angle) ?
			(addend.equals(Angle.ZERO)) ? this : new Angle(this.valueOf() + addend.valueOf()) :
			this.plus(new Angle(addend))
	}

	/**
	 * Subtract another Angle (the subtrahend) from this (the minuend).
	 *
	 * Note that subtraction is not commutative: `a - b` does not always equal `b - a`.
	 * @param   subtrahend the Angle to subtract from this one
	 * @returns a new Angle representing the difference, `minuend - subtrahend`
	 */
	minus(subtrahend: Angle|number): Angle {
		return (subtrahend instanceof Angle) ?
			(subtrahend.equals(Angle.ZERO)) ? this : new Angle(this.valueOf() - subtrahend.valueOf()) :
			this.minus(new Angle(subtrahend))
	}

	/**
	 * Scale this Angle by a scalar factor.
	 *
	 * If the scale factor is <1, returns a new Angle "more acute"  than this Angle.
	 * If the scale factor is >1, returns a new Angle "more obtuse" than this Angle.
	 * If the scale factor is =1, returns a new Angle equal to           this Angle.
	 * @param   scalar the scale factor
	 * @returns a new Angle representing the product
	 */
	scale(scalar: Percentage|number = 1): Angle {
		return (scalar instanceof Percentage) ?
			new Angle(this.valueOf() * scalar.valueOf()) :
			this.scale(new Percentage(scalar).of(this.valueOf()))
	}

	/**
	 * Return this Angle’s measurement in the given unit.
	 * @param   unit the unit to convert to
	 * @returns the numeric value of the measure of this Angle
	 */
	convert(unit: AngleUnit): number {
		return this.valueOf() * Angle.CONVERSION[unit]
	}
}
