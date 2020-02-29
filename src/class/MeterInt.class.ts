import type Fraction from './Fraction.class'
import Meter from './Meter.class'


// COMBAK import functions from extrajs^0.21
const Math_minBigInt = (a: bigint, b: bigint): bigint =>
	a < b ? a : b

const Math_maxBigInt = (a: bigint, b: bigint): bigint =>
	a < b ? b : a

const Math_clampBigInt = (min: bigint, val: bigint, max: bigint): bigint =>
	min <= max ? Math_minBigInt(Math_maxBigInt(min, val), max) : Math_clampBigInt(max, val, min)


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
		this._min = min
		this._max = Math_maxBigInt(min, max)
		this._val = Math_clampBigInt(min, val, max)
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
		this._min = min
		this.max = this._max
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
		this._max = Math_maxBigInt(this._min, max)
		this.value = this._val
	}
	/**
	 * Set the value.
	 *
	 * The new value must be loosely between the minimum and maximum.
	 *
	 * @param   val the value
	 */
	set value(val: bigint) {
		this._val = Math_clampBigInt(this._min, val, this._max)
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
		this._low = (low === null) ? low : Math_clampBigInt(this._min, low, this._max)
		this.high = this._high
	}
	/**
	 * Set the high.
	 *
	 * The new high must be loosely between the low (if it exists, else the minimum) and the maximum.
	 * @param   high the high
	 */
	set high(high: bigint|null) {
		const low: bigint = (this._low !== null) ? this._low : this._min
		this._high = (high !== null) ? Math_clampBigInt(low, high, this._max) : high
	}
	/**
	 * Set the optimum.
	 *
	 * The new optimum must be loosely between the minimum and maximum.
	 *
	 * @param   opt the optimum
	 */
	set optimum(opt: bigint|null) {
		this._opt = (opt !== null) ? Math_clampBigInt(this._min, opt, this._max) : opt
	}

	/**
	 * @see Meter#fraction
	 * @returns exactly `(this.value - this.min) / (this.max - this.min)`
	 */
	fraction(): Fraction {
		const meter = new Meter(
			Number(this.min),
			Number(this.value),
			Number(this.max),
		)
		meter.low     = Number(this.low)
		meter.high    = Number(this.high)
		meter.optimum = Number(this.optimum)
		return meter.fraction()
	}

	/**
	 * @see Meter#intervals
	 * @returns the ranges (between minimum, low, high, maximum), and preference based on where the optimum exists; else `null`
	 */
	intervals(): {
		interval: [number, number];
		preference: number;
	}[]|null {
		const meter = new Meter(
			Number(this.min),
			Number(this.value),
			Number(this.max),
		)
		meter.low     = Number(this.low)
		meter.high    = Number(this.high)
		meter.optimum = Number(this.optimum)
		return meter.intervals()
	}
}
