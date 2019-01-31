import Fraction from './Fraction.class'
import Integer from './Integer.class'
import Meter from './Meter.class'


/**
 * A MeterInt is like a {@link Meter} whose properties are all integers.
 *
 * - the maximum must be strictly greater than the minimum
 * - the value must fall loosly between them (inclusively)
 * - the low must be loosly between the minimum and the maximum
 * - the high must be loosly between the low (if it exists, else the minimum) and the maximum
 * - the optimum must be loosly between the minimum and maximum
 *
 * @todo COMBAK: replace `Integer` values with `bigint`
 */
export default class MeterInt {
	/** The underlying Meter, which provides all the logic. */
	private readonly _METER: Meter;
	/** The minimum. */
	private _min: Integer;
	/** The maximum. */
	private _max: Integer;
	/** The value. */
	private _val: Integer;
	/** The low. */
	private _low: Integer|null = null;
	/** The high. */
	private _high: Integer|null = null;
	/** The optimum. */
	private _opt: Integer|null = null;

	/**
	 * Construct a new MeterInt object.
	 * @param   min the minimum of this Meter
	 * @param   val the value   of this Meter
	 * @param   max the maximum of this Meter
	 */
	constructor(min: Integer|number = 0, val: Integer|number = 0, max: Integer|number = 1) {
		this._METER = new Meter(min.valueOf(), val.valueOf(), max.valueOf())
		this._min = new Integer(this._METER.min)
		this._max = new Integer(this._METER.max)
		this._val = new Integer(this._METER.value)
	}

	/**
	 * Get the minimum.
	 * @returns the minimum
	 */
	get min(): Integer {
		return this._min
	}
	/**
	 * Get the maximum.
	 * @returns the maximum
	 */
	get max(): Integer {
		return this._max
	}
	/**
	 * Get the value.
	 * @returns the value
	 */
	get value(): Integer {
		return this._val
	}
	/**
	 * Get the low.
	 * @returns the low
	 */
	get low(): Integer|null {
		return this._low
	}
	/**
	 * Get the high.
	 * @returns the high
	 */
	get high(): Integer|null {
		return this._high
	}
	/**
	 * Get the optimum.
	 * @returns the optimum
	 */
	get optimum(): Integer|null {
		return this._opt
	}

	/**
	 * Set the minimum.
	 *
	 * This method clamps the maximum to be strictly greater than the new minimum,
	 * and then clamps the value loosly between the new minimum and the maximum.
	 * @param   min the maximum
	 */
	set min(min: Integer) {
		this._METER.min = min.valueOf()
		this._min = new Integer(this._METER.min)
	}
	/**
	 * Set the maximum.
	 *
	 * The new maximum must be strictly greater than the minimum.
	 *
	 * This method clamps the value between the minimum and the new maximum.
	 * @param   max the maximum
	 */
	set max(max: Integer) {
		this._METER.max = max.valueOf()
		this._max = new Integer(this._METER.max)
	}
	/**
	 * Set the value.
	 *
	 * The new value must be loosly between the minimum and maximum.
	 *
	 * @param   val the value
	 */
	set value(val: Integer) {
		this._METER.value = val.valueOf()
		this._val = new Integer(this._METER.value)
	}
	/**
	 * Set the low.
	 *
	 * The new low must be loosly between the minimum and the maximum.
	 *
	 * This method clamps the high to be loosly greater than the new low.
	 * @param   low the low
	 */
	set low(low: Integer|null) {
		if (low === null) {
			this._METER.low = this._low = low
		} else {
			this._METER.low = low.valueOf()
			this._low = new Integer(this._METER.low)
		}
	}
	/**
	 * Set the high.
	 *
	 * The new high must be loosly between the low (if it exists, else the minimum) and the maximum.
	 * @param   high the high
	 */
	set high(high: Integer|null) {
		if (high === null) {
			this._METER.high = this._high = high
		} else {
			this._METER.high = high.valueOf()
			this._high = new Integer(this._METER.high)
		}
	}
	/**
	 * Set the optimum.
	 *
	 * The new optimum must be loosly between the minimum and maximum.
	 *
	 * @param   opt the optimum
	 */
	set optimum(opt: Integer|null) {
		if (opt === null) {
			this._METER.optimum = this._opt = opt
		} else {
			this._METER.optimum = opt.valueOf()
			this._opt = new Integer(this._METER.optimum)
		}
	}

	/**
	 * @see Meter#fraction
	 * @returns exactly `(this.value - this.min) / (this.max - this.min)`
	 */
	fraction(): Fraction {
		return this._METER.fraction()
	}

	/**
	 * @see Meter#intervals
	 * @returns the ranges (between minimum, low, high, maximum), and preference based on where the optimum exists; else `null`
	 */
	intervals(): {
		interval: [number, number];
		preference: number;
	}[]|null {
		return this._METER.intervals()
	}
}
