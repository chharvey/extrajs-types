import * as xjs from 'extrajs'
import Percentage from './Percentage.class'

// TODO update extrajs@0.15.0+
function xjs_Number_approx(x: number, y: number, epsilon: number = Number.EPSILON): boolean {
	return Math.abs(x - y) < epsilon
}


/**
 * A list of possible angle units.
 * @see https://drafts.csswg.org/css-values-3/#angles
 */
enum Unit {
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
	static readonly CONVERSION: { readonly [index in Unit]: number } = {
		[Unit.DEG ]: 360,
		[Unit.GRAD]: 400,
		[Unit.RAD ]: 2 * Math.PI,
		[Unit.TURN]: 1,
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
	 * Construct a new Angle object.
	 * @param   x the numeric value of this Angle
	 */
	constructor(x: Angle|number = 0) {
		x = x.valueOf()
		super(xjs.Math.mod(x, 1))
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
	 * @returns the result of `Math.sin()`
	 */
	get sin(): number {
		return Math.sin(this.convert(Unit.RAD))
	}

	/**
	 * Get the cosine of this angle.
	 * @returns the result of `Math.cos()`
	 */
	get cos(): number {
		return Math.cos(this.convert(Unit.RAD))
	}

	/**
	 * Get the tangent of this angle.
	 * @returns the result of `Math.tan()`
	 */
	get tan(): number {
		return Math.tan(this.convert(Unit.RAD))
	}

	/**
	 * Get the cosecant of this angle.
	 * @returns the result of `1 / Math.sin()`
	 */
	get csc(): number {
		return 1 / this.sin
	}

	/**
	 * Get the secant of this angle.
	 * @returns the result of `1 / Math.cos()`
	 */
	get sec(): number {
		return 1 / this.cos
	}

	/**
	 * Get the cotangent of this angle.
	 * @returns the result of `1 / Math.tan()`
	 */
	get cot(): number {
		return 1 / this.tan
	}

	/** @override */
	toString(radix?: number, unit?: Unit): string {
		return (unit) ?
			`${this.convert(unit).toString(radix)}${Unit[unit].toLowerCase()}` :
			super.toString(radix)
	}

	/**
	 * Return whether this Angle’s value equals the argument’s.
	 * @param   angle the Angle to compare
	 * @returns does this Angle equal the argument?
	 */
	equals(angle: Angle|number): boolean {
		return (angle instanceof Angle) ? xjs_Number_approx(this.valueOf(), angle.valueOf()) : this.equals(new Angle(angle))
	}

	/**
	 * Return how this Angle compares to (is less than) another.
	 * @param   angle the Angle to compare
	 * @returns is this Angle strictly less than the argument?
	 */
	lessThan(angle: Angle|number): boolean {
		return (this.equals(angle)) ? false : (angle instanceof Angle) ? this.valueOf() < angle.valueOf() : this.lessThan(new Angle(angle))
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
	clamp(min: Angle, max: Angle): Angle {
		return (min.lessThan(max) || min.equals(max)) ? Angle.min(Angle.max(min, this), max) : this.clamp(max, min)
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
	 * @param   scalar the non-negative scale factor
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
	convert(unit: Unit): number {
		return this.valueOf() * Angle.CONVERSION[unit]
	}
}
