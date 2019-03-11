import * as xjs from 'extrajs'


/**
 * A list of possible absolute Duration units.
 * @see https://www.w3.org/TR/css-values/#time
 */
export enum DurationUnit {
	/** Seconds. The second is the official SI unit of time. */
	S,
	/** Milliseconds. `1000ms == 1s`. */
	MS,
	/** Nanoseconds. `1 000 000 000 ns == 1s`. */
	NS,
	/** Minutes. `1min == 60s`. */
	MIN,
	/** Hours. `1hr == 60min`. */
	HR,
	/** Days. `1day == 24hr`. */
	D,
}


/**
 * A one-dimensional temporal measurement.
 */
export default class Duration extends Number {
	/**
	 * A dictionary of conversion rates.
	 *
	 * The value assigned to each unit is the number of units in one second.
	 */
	static readonly CONVERSION: { readonly [index in DurationUnit]: number } = {
		[DurationUnit.S  ]: 1,
		[DurationUnit.MS ]: 1000,
		[DurationUnit.NS ]: 1000000000,
		[DurationUnit.MIN]: 1 / 60,
		[DurationUnit.HR ]: 1 / (60 * 60),
		[DurationUnit.D  ]: 1 / (24 * 60 * 60),
	}

	/**
	 * An immutable RegExp instance, representing a string in Duration format.
	 */
	static readonly REGEXP: Readonly<RegExp> = new RegExp(`^${xjs.Number.REGEXP.source.slice(1,-1)}(?:s|ms|ns|min|hr|d)$`)

	/**
	 * Return the maximum of two or more Durations.
	 * @param   durations two or more Durations to compare
	 * @returns the greatest of all the arguments
	 * @throws  {Error} if no arguments are provided
	 */
	static max(...durations: Duration[]): Duration {
		try {
			return new Duration(Math.max(...durations.map((x) => x.valueOf())))
		} catch {
			throw new Error('No arguments provided.')
		}
	}

	/**
	 * Return the minimum of two or more Durations.
	 * @param   durations two or more Durations to compare
	 * @returns the least of all the arguments
	 * @throws  {Error} if no arguments are provided
	 */
	static min(...durations: Duration[]): Duration {
		try {
			return new Duration(Math.min(...durations.map((x) => x.valueOf())))
		} catch {
			throw new Error('No arguments provided.')
		}
	}


	/**
	 * Construct a new Duration object.
	 * @param   x the numeric value of this Duration
	 */
	constructor(x?: Duration|number, unit?: DurationUnit);
	/**
	 * Parse a string of the form `'‹n›‹u›'`, where `‹n›` is a number and `‹u›` is a duration unit.
	 * @param   str the string to parse
	 * @returns a new Duration emulating the string
	 * @throws  {RangeError} if the string given is not of the correct format
	 */
	constructor(str: string);
	constructor(x: Duration|number|string = 0, unit: DurationUnit = DurationUnit.S) {
		if (typeof x === 'string') {
			if (!Duration.REGEXP.test(x)) throw new RangeError(`Invalid string format: '${x}'.`)
			let numeric_part: number = +x.match(xjs.Number.REGEXP.source.slice(1,-1)) ![0]
			let unit_part   : string =  x.match(/s|ms|ns|min|hr|d/                  ) ![0]
			x = xjs.Object.switch<number>(unit_part, {
				's'  : () => numeric_part / Duration.CONVERSION[DurationUnit.S  ],
				'ms' : () => numeric_part / Duration.CONVERSION[DurationUnit.MS ],
				'ns' : () => numeric_part / Duration.CONVERSION[DurationUnit.NS ],
				'min': () => numeric_part / Duration.CONVERSION[DurationUnit.MIN],
				'hr' : () => numeric_part / Duration.CONVERSION[DurationUnit.HR ],
				'd'  : () => numeric_part / Duration.CONVERSION[DurationUnit.D  ],
			})()
		}
		x = x.valueOf()
		xjs.Number.assertType(x, 'non-negative')
		xjs.Number.assertType(x, 'finite')
		super(x / Duration.CONVERSION[unit])
	}

	/** @override Object */
	toString(radix: number = 10, unit: DurationUnit = DurationUnit.S): string {
		return `${this.convert(unit).toString(radix)}${DurationUnit[unit].toLowerCase()}`
	}

	/**
	 * Return whether this Duration’s value equals the argument’s.
	 * @param   duration the Duration to compare
	 * @returns does this Duration equal the argument?
	 */
	equals(duration: Duration|number): boolean {
		if (this === duration) return true
		return (duration instanceof Duration) ? this.valueOf() === duration.valueOf() : this.equals(new Duration(duration))
	}

	/**
	 * Return how this Duration compares to (is less than) another.
	 * @param   duration the Duration to compare
	 * @returns is this Duration strictly less than the argument?
	 */
	lessThan(duration: Duration|number): boolean {
		return (duration instanceof Duration) ? this.valueOf() < duration.valueOf() : this.lessThan(new Duration(duration))
	}

	/**
	 * Return this Duration, clamped between two bounds.
	 *
	 * This method returns this unchanged iff it is weakly between `min` and `max`;
	 * it returns `min` iff this is strictly less than `min`;
	 * and `max` iff this is strictly greater than `max`.
	 * If `min === max` then this method returns that value.
	 * If `min > max` then this method switches the bounds.
	 * @param   min the lower bound
	 * @param   max the upper bound
	 * @returns `Duration.min(Duration.max(min, this), max)`
	 */
	clamp(min: Duration|number, max: Duration|number): Duration {
		return (min instanceof Duration && max instanceof Duration) ?
			(min.lessThan(max) || min.equals(max)) ? Duration.min(Duration.max(min, this), max) : this.clamp(max, min) :
			this.clamp(new Duration(min), new Duration(max))
	}

	/**
	 * Add this Duration (the augend) to another (the addend).
	 * @param   addend the Duration to add to this one
	 * @returns a new Duration representing the sum, `augend + addend`
	 * @throws  {RangeError} if the result is less than 0
	 */
	plus(addend: Duration|number): Duration {
		addend = addend.valueOf()
		if (addend === 0) return this
		const returned: number = this.valueOf() + addend
		if (returned < 0) throw new RangeError(`Cannot add ${addend} to ${this.valueOf()}: result is less than 0.`)
		return new Duration(returned)
	}

	/**
	 * Subtract another Duration (the subtrahend) from this (the minuend).
	 *
	 * The subtrahend must be smaller than or equal to the minuend (this),
	 * because negative durations are not possible.
	 *
	 * Note that subtraction is not commutative: `a - b` does not always equal `b - a`.
	 * @param   subtrahend the Duration to subtract from this one
	 * @returns a new Duration representing the difference, `minuend - subtrahend`
	 * @throws  {RangeError} if the subtrahend is larger than this
	 */
	minus(subtrahend: Duration|number): Duration {
		if (this.lessThan(subtrahend)) throw new RangeError('Cannot subtract a larger duration from a smaller duration.')
		return this.plus(-subtrahend)
	}

	/**
	 * Scale this Duration by a scalar factor.
	 *
	 * If the scale factor is <1, returns a new Duration ‘shorter’ than this Duration.
	 * If the scale factor is >1, returns a new Duration ‘longer’  than this Duration.
	 * If the scale factor is =1, returns a new Duration equal to       this Duration.
	 * The scale factor cannot be negative.
	 * @param   scalar the scale factor
	 * @returns a new Duration representing the product
	 * @throws  {AssertionError} if `scalar` is negative
	 */
	scale(scalar: number = 1): Duration {
		xjs.Number.assertType(scalar, 'non-negative')
		return new Duration(this.valueOf() * scalar)
	}

	/**
	 * Return the ratio of this Duration (the dividend) to the argument (the divisor).
	 *
	 * Note: to “divide” this Duration into even pieces, call {@link Duration.scale}.
	 * @param   divisior the Duration to divide this one by
	 * @returns a number equal to the quotient, `dividend / divisor`
	 */
	ratio(divisor: Duration|number = 1): number {
		return (divisor instanceof Duration) ?
			this.valueOf() / divisor.valueOf() :
			this.ratio(new Duration(divisor))
	}

	/**
	 * Return this Duration’s measurement in the given unit.
	 * @param   unit the unit to convert to
	 * @returns the numeric value of the measure of this Duration
	 */
	convert(unit: DurationUnit): number {
		return this.valueOf() * Duration.CONVERSION[unit]
	}
}
