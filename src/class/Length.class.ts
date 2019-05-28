import * as xjs from 'extrajs'


/**
 * A list of possible absolute Length units.
 * @see https://www.w3.org/TR/css-values/#absolute-lengths
 */
export enum LengthUnit {
	/** Centimeters. The meter is the official SI unit of length, and `100cm == 1m`. */
	CM,
	/** Millimeters. `10mm == 1cm`. */
	MM,
	/** Inches. `1in == 2.54cm`, or approximately `0.3937in == 1cm`. */
	IN,
	/** Points. `72pt == 1in`. */
	PT,
	/** Pixels. (Visual, not physical pixels.) `96px == 1in`. */
	PX,
}


/**
 * A one-dimensional linear measurement.
 */
export default class Length extends Number {
	/**
	 * A dictionary of conversion rates.
	 *
	 * The value assigned to each unit is the number of units in one centimeter.
	 */
	static readonly CONVERSION: { readonly [index in LengthUnit]: number } = {
		[LengthUnit.CM]: 1,
		[LengthUnit.MM]: 10,
		[LengthUnit.IN]:  1 / 2.54,
		[LengthUnit.PT]: 72 / 2.54,
		[LengthUnit.PX]: 96 / 2.54,
	}

	/**
	 * An immutable RegExp instance, representing a string in Length format.
	 */
	static readonly REGEXP: Readonly<RegExp> = new RegExp(`^${xjs.Number.REGEXP.source.slice(1,-1)}(?:cm|mm|in|pt|px)$`)

	/**
	 * Return the maximum of two or more Lengths.
	 * @param   lengths two or more Lengths to compare
	 * @returns the greatest of all the arguments
	 */
	static max(...lengths: Length[]): Length {
		return new Length(Math.max(...lengths.map((x) => x.valueOf())))
		// return lengths.sort((a, b) => (a.lessThan(b)) ? -1 : (b.lessThan(a)) ? 1 : 0).lastItem
	}

	/**
	 * Return the minimum of two or more Lengths.
	 * @param   lengths two or more Lengths to compare
	 * @returns the least of all the arguments
	 */
	static min(...lengths: Length[]): Length {
		return new Length(Math.min(...lengths.map((x) => x.valueOf())))
		// return lengths.sort((a, b) => (a.lessThan(b)) ? -1 : (b.lessThan(a)) ? 1 : 0)[0]
	}

	/**
	 * @deprecated WARNING{DEPRECATED} use constructor `new Length()` instead.
	 */
	static fromString(str: string): Length {
		console.warn('`Length#fromString()` is deprecated. Use `new Length()` instead.')
		return new Length(str)
	}


	/**
	 * Construct a new Length object.
	 * @param   x the numeric value of this Length
	 */
	constructor(x?: Length|number, unit?: LengthUnit);
	/**
	 * Parse a string of the form `'‹n›‹u›'`, where `‹n›` is a number and `‹u›` is a length unit.
	 * @param   str the string to parse
	 * @returns a new Length emulating the string
	 * @throws  {RangeError} if the string given is not of the correct format
	 */
	constructor(str: string);
	constructor(x: Length|number|string = 0, unit: LengthUnit = LengthUnit.CM) {
		if (typeof x === 'string') {
			if (!Length.REGEXP.test(x)) throw new RangeError(`Invalid string format: '${x}'.`)
			let numeric_part: number = +x.match(xjs.Number.REGEXP.source.slice(1,-1)) ![0]
			let unit_part   : string =  x.match(/cm|mm|in|pt|px/                    ) ![0]
			x = xjs.Object.switch<number>(unit_part, {
				'cm': () => numeric_part / Length.CONVERSION[LengthUnit.CM],
				'mm': () => numeric_part / Length.CONVERSION[LengthUnit.MM],
				'in': () => numeric_part / Length.CONVERSION[LengthUnit.IN],
				'pt': () => numeric_part / Length.CONVERSION[LengthUnit.PT],
				'px': () => numeric_part / Length.CONVERSION[LengthUnit.PX],
			})()
		}
		x = x.valueOf()
		xjs.Number.assertType(x, 'non-negative')
		xjs.Number.assertType(x, 'finite')
		super(x / Length.CONVERSION[unit])
	}

	/** @override Object */
	toString(radix: number = 10, unit: LengthUnit = LengthUnit.CM): string {
		return `${this.convert(unit).toString(radix)}${LengthUnit[unit].toLowerCase()}`
	}

	/**
	 * Return whether this Length’s value equals the argument’s.
	 * @param   length the Length to compare
	 * @returns does this Length equal the argument?
	 */
	equals(length: Length|number): boolean {
		if (this === length) return true
		return (length instanceof Length) ? this.valueOf() === length.valueOf() : this.equals(new Length(length))
	}

	/**
	 * Return how this Length compares to (is less than) another.
	 * @param   length the Length to compare
	 * @returns is this Length strictly less than the argument?
	 */
	lessThan(length: Length|number): boolean {
		return (length instanceof Length) ? this.valueOf() < length.valueOf() : this.lessThan(new Length(length))
	}

	/**
	 * Return this Length, clamped between two bounds.
	 *
	 * This method returns this unchanged iff it is weakly between `min` and `max`;
	 * it returns `min` iff this is strictly less than `min`;
	 * and `max` iff this is strictly greater than `max`.
	 * If `min === max` then this method returns that value.
	 * If `min > max` then this method switches the bounds.
	 * @param   min the lower bound
	 * @param   max the upper bound
	 * @returns `Length.min(Length.max(min, this), max)`
	 */
	clamp(min: Length|number, max: Length|number): Length {
		return (min instanceof Length && max instanceof Length) ?
			(min.lessThan(max) || min.equals(max)) ? Length.min(Length.max(min, this), max) : this.clamp(max, min) :
			this.clamp(new Length(min), new Length(max))
	}

	/**
	 * Add this Length (the augend) to another (the addend).
	 * @param   addend the Length to add to this one
	 * @returns a new Length representing the sum, `augend + addend`
	 * @throws  {RangeError} if the result is less than 0
	 */
	plus(addend: Length|number): Length {
		addend = addend.valueOf()
		if (addend === 0) return this
		const returned: number = this.valueOf() + addend
		if (returned < 0) throw new RangeError(`Cannot add ${addend} to ${this.valueOf()}: result is less than 0.`)
		return new Length(returned)
	}

	/**
	 * Subtract another Length (the subtrahend) from this (the minuend).
	 *
	 * The subtrahend must be smaller than or equal to the minuend (this),
	 * because negative lengths are not possible.
	 *
	 * Note that subtraction is not commutative: `a - b` does not always equal `b - a`.
	 * @param   subtrahend the Length to subtract from this one
	 * @returns a new Length representing the difference, `minuend - subtrahend`
	 * @throws  {RangeError} if the subtrahend is larger than this
	 */
	minus(subtrahend: Length|number): Length {
		if (this.lessThan(subtrahend)) throw new RangeError('Cannot subtract a larger length from a smaller length.')
		return this.plus(-subtrahend)
	}

	/**
	 * Scale this Length by a scalar factor.
	 *
	 * If the scale factor is <1, returns a new Length ‘shorter’ than this Length.
	 * If the scale factor is >1, returns a new Length ‘longer’  than this Length.
	 * If the scale factor is =1, returns a new Length equal to       this Length.
	 * The scale factor cannot be negative.
	 * @param   scalar the scale factor
	 * @returns a new Length representing the product
	 * @throws  {AssertionError} if `scalar` is negative
	 */
	scale(scalar: number = 1): Length {
		xjs.Number.assertType(scalar, 'non-negative')
		return new Length(this.valueOf() * scalar)
	}

	// /**
	//  * Multiply this Length (the multiplicand) by another (the multiplier).
	//  *
	//  * If needing to multiply this Length by another Area, call {@link Area.times|Area#times(length)}
	//  * on that Area object, passing this object as the argument.
	//  * @param   multiplier the Length to multiply this one by
	//  * @returns an Area representing the product, `multiplicand * multiplier`
	//  */
	// times(multiplier: Length|number = 1): Area {
	// 	return (multiplier instanceof Length) ?
	// 		(multiplier.equals(0)) ? new Area(0) : (multiplier.equals(1)) ? this : new Area(this.valueOf() * multiplier.valueOf()) :
	// 		this.times(new Length(multiplier))
	// }

	// /**
	//  * Return the product of this with itself.
	//  * @returns `this.times(this)`
	//  */
	// square(): Area {
	// 	return this.times(this)
	// }

	// /**
	//  * Return the product of this with its square.
	//  * @returns `this.square().times(this)`
	//  */
	// cube(): Volume {
	// 	return this.square().times(this)
	// }

	/**
	 * Return the ratio of this Length (the dividend) to the argument (the divisor).
	 *
	 * Note: to “divide” this Length into even pieces, call {@link Length.scale}.
	 * @param   divisior the Length to divide this one by
	 * @returns a number equal to the quotient, `dividend / divisor`
	 */
	ratio(divisor: Length|number = 1): number {
		return (divisor instanceof Length) ?
			this.valueOf() / divisor.valueOf() :
			this.ratio(new Length(divisor))
	}

	/**
	 * Return this Length’s measurement in the given unit.
	 * @param   unit the unit to convert to
	 * @returns the numeric value of the measure of this Length
	 */
	convert(unit: LengthUnit): number {
		return this.valueOf() * Length.CONVERSION[unit]
	}
}
