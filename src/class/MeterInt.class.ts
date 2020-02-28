import type Fraction from './Fraction.class'
import Meter from './Meter.class'


/**
 * A MeterInt is like a {@link Meter} whose properties are all integers.
 *
 * - the maximum must be strictly greater than the minimum
 * - the value must fall loosly between them (inclusively)
 * - the low must be loosly between the minimum and the maximum
 * - the high must be loosly between the low (if it exists, else the minimum) and the maximum
 * - the optimum must be loosly between the minimum and maximum
 */
export default class MeterInt {
	/** The underlying Meter, which provides all the logic. */
	private readonly _METER: Meter;
	/** The minimum. */
	private _min: bigint;
	/** The maximum. */
	private _max: bigint;
	/** The value. */
	private _val: bigint;
	/** The low. */
	private _low: bigint|null = null;
	/** The high. */
	private _high: bigint|null = null;
	/** The optimum. */
	private _opt: bigint|null = null;

	/**
	 * Construct a new MeterInt object.
	 * @param   min the minimum of this Meter
	 * @param   val the value   of this Meter
	 * @param   max the maximum of this Meter
	 */
	constructor(min: bigint = 0n, val: bigint = 0n, max: bigint = 1n) {
		this._METER = new Meter(Number(min), Number(val), Number(max))
		this._min = BigInt(this._METER.min)
		this._max = BigInt(this._METER.max)
		this._val = BigInt(this._METER.value)
	}

	/**
	 * Get the minimum.
	 * @returns the minimum
	 */
	get min(): bigint {
		return this._min
	}
	/**
	 * Get the maximum.
	 * @returns the maximum
	 */
	get max(): bigint {
		return this._max
	}
	/**
	 * Get the value.
	 * @returns the value
	 */
	get value(): bigint {
		return this._val
	}
	/**
	 * Get the low.
	 * @returns the low
	 */
	get low(): bigint|null {
		return this._low
	}
	/**
	 * Get the high.
	 * @returns the high
	 */
	get high(): bigint|null {
		return this._high
	}
	/**
	 * Get the optimum.
	 * @returns the optimum
	 */
	get optimum(): bigint|null {
		return this._opt
	}

	/**
	 * Set the minimum.
	 *
	 * This method clamps the maximum to be strictly greater than the new minimum,
	 * and then clamps the value loosely between the new minimum and the maximum.
	 * @param   min the maximum
	 */
	set min(min: bigint) {
		this._METER.min = Number(min)
		this._min = BigInt(this._METER.min)
	}
	/**
	 * Set the maximum.
	 *
	 * The new maximum must be strictly greater than the minimum.
	 *
	 * This method clamps the value between the minimum and the new maximum.
	 * @param   max the maximum
	 */
	set max(max: bigint) {
		this._METER.max = Number(max)
		this._max = BigInt(this._METER.max)
	}
	/**
	 * Set the value.
	 *
	 * The new value must be loosely between the minimum and maximum.
	 *
	 * @param   val the value
	 */
	set value(val: bigint) {
		this._METER.value = Number(val)
		this._val = BigInt(this._METER.value)
	}
	/**
	 * Set the low.
	 *
	 * The new low must be loosely between the minimum and the maximum.
	 *
	 * This method clamps the high to be loosely greater than the new low.
	 * @param   low the low
	 */
	set low(low: bigint|null) {
		if (low === null) {
			this._METER.low = this._low = low
		} else {
			this._METER.low = Number(low)
			this._low = BigInt(this._METER.low)
		}
	}
	/**
	 * Set the high.
	 *
	 * The new high must be loosely between the low (if it exists, else the minimum) and the maximum.
	 * @param   high the high
	 */
	set high(high: bigint|null) {
		if (high === null) {
			this._METER.high = this._high = high
		} else {
			this._METER.high = Number(high)
			this._high = BigInt(this._METER.high)
		}
	}
	/**
	 * Set the optimum.
	 *
	 * The new optimum must be loosely between the minimum and maximum.
	 *
	 * @param   opt the optimum
	 */
	set optimum(opt: bigint|null) {
		if (opt === null) {
			this._METER.optimum = this._opt = opt
		} else {
			this._METER.optimum = Number(opt)
			this._opt = BigInt(this._METER.optimum)
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
