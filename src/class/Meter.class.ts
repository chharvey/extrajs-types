import * as xjs from 'extrajs'

import Fraction from './Fraction.class'
import { Interval, OpenInterval, ClosedInterval } from './Interval.class'


/**
 * A Meter is a scalar value within a known range. It is isomorphic to {@link Fraction},
 * but it lacks mathematical operations (such as addition and multiplication) and its range need not be [0,1].
 *
 * A Meter must have these 3 numeric properties: a **minimum**, a **maximum**, and a **value**.
 * Optionally, a Meter may also have the numeric properties **low**, **high**, and **optimum**.
 * All six properties must be writable.
 *
 * - the maximum must be loosly greater than the minimum
 * - the value must fall loosly between them (inclusively)
 * - the low must be loosly between the minimum and the maximum
 * - the high must be loosly between the low (if it exists, else the minimum) and the maximum
 * - the optimum must be loosly between the minimum and maximum
 */
export default class Meter {
	/** The minimum. */
	private _min: number;
	/** The maximum. */
	private _max: number;
	/** The value. */
	private _val: number;
	/** The low. */
	private _low: number|null = null;
	/** The high. */
	private _high: number|null = null;
	/** The optimum. */
	private _opt: number|null = null;

	/**
	 * Construct a new Meter object.
	 * @param   min the minimum of this Meter
	 * @param   val the value   of this Meter
	 * @param   max the maximum of this Meter
	 */
	constructor(min: number = 0, val: number = 0, max: number = 1) {
		xjs.Number.assertType(min, 'finite')
		xjs.Number.assertType(val, 'finite')
		xjs.Number.assertType(max, 'finite')
		this._min = min
		this._max = Math.max(min, max)
		this._val = xjs.Math.clamp(min, val, max)
	}

	/**
	 * Get the minimum.
	 * @returns the minimum
	 */
	get min(): number {
		return this._min
	}
	/**
	 * Get the maximum.
	 * @returns the maximum
	 */
	get max(): number {
		return this._max
	}
	/**
	 * Get the value.
	 * @returns the value
	 */
	get value(): number {
		return this._val
	}
	/**
	 * Get the low.
	 * @returns the low
	 */
	get low(): number|null {
		return this._low
	}
	/**
	 * Get the high.
	 * @returns the high
	 */
	get high(): number|null {
		return this._high
	}
	/**
	 * Get the optimum.
	 * @returns the optimum
	 */
	get optimum(): number|null {
		return this._opt
	}

	/**
	 * Set the minimum.
	 *
	 * This method clamps the maximum to be loosly greater than the new minimum,
	 * and then clamps the value loosly between the new minimum and the maximum.
	 * @param   min the maximum
	 */
	set min(min: number) {
		xjs.Number.assertType(min, 'finite')
		this._min = min
		this.max = this._max
	}
	/**
	 * Set the maximum.
	 *
	 * The new maximum must be loosly greater than the minimum.
	 *
	 * This method clamps the value between the minimum and the new maximum.
	 * @param   max the maximum
	 */
	set max(max: number) {
		this._max = xjs.Math.clamp(this._min, max, Infinity)
		this.value = this._val
	}
	/**
	 * Set the value.
	 *
	 * The new value must be loosly between the minimum and maximum.
	 *
	 * @param   val the value
	 */
	set value(val: number) {
		this._val = xjs.Math.clamp(this._min, val, this._max)
	}
	/**
	 * Set the low.
	 *
	 * The new low must be loosly between the minimum and the maximum.
	 *
	 * This method clamps the high to be loosly greater than the new low.
	 * @param   low the low
	 */
	set low(low: number|null) {
		this._low = (low === null) ? low : xjs.Math.clamp(this._min, low, this._max)
		this.high = this._high
	}
	/**
	 * Set the high.
	 *
	 * The new high must be loosly between the low (if it exists, else the minimum) and the maximum.
	 * @param   high the high
	 */
	set high(high: number|null) {
		let low: number = (this._low !== null) ? this._low : this._min
		this._high = (high === null) ? high : xjs.Math.clamp(low, high, this._max)
	}
	/**
	 * Set the optimum.
	 *
	 * The new optimum must be loosly between the minimum and maximum.
	 *
	 * @param   opt the optimum
	 */
	set optimum(opt: number|null) {
		this._opt = (opt === null) ? opt : xjs.Math.clamp(this._min, opt, this._max)
	}

	/**
	 * Compute the fraction of this Meter’s value within its range.
	 *
	 * I.e. if the value is equal to the minimum, 0 is returned;
	 * if the value is equal to the maximum, 1 is returned.
	 *
	 * In other words, it’s a reverse interpolation.
	 * @returns exactly `(this.value - this.min) / (this.max - this.min)`
	 */
	fraction(): Fraction {
		return new Fraction((this._val - this._min) / (this._max - this._min))
	}

	/**
	 * Return the intervals defined within this Meter,
	 * and the preference of the intervals based on the optimum.
	 *
	 * If the optimum does not exist, this method returns `null`.
	 *
	 * The following table describes the preference value:
	 *
	 * condition                                       | preference value
	 * ----------                                      |-------------
	 * the optimum is in the interval                  | `1`
	 * the optimum is in an adjacent interval          | `2`
	 * the optimum is not in an adjacent interval      | `3`
	 *
	 * Example:
	 * ```
	 * min         low                       high     max
	 * |------------|-------------------------|--------|
	 *                                            ^
	 *                                         optimum
	 * ```
	 * In the example above, there are 3 intervals, and the optimum value is in the
	 * right-most (highest) interval. Then the preferences of the intervals are:
	 * `[min, low]: 3, [low, high]: 2, [high–max]: 1`.
	 *
	 * @returns the ranges (between minimum, low, high, maximum), and preference based on where the optimum exists; else `null`
	 */
	intervals(): {
		interval: [number, number];
		preference: number;
	}[]|null {
		if (this._opt === null) return null
		let a: ClosedInterval;
		let c: ClosedInterval;
		if (this._low !== null) {
			a = new ClosedInterval(this._min, this._low)
			c = (this._high !== null) ? new ClosedInterval(this._high, this._max) : new ClosedInterval(this._low, this._max)
		} else {
			if (this._high !== null) {
				a = new ClosedInterval(this._min, this._high)
				c = new ClosedInterval(this._high, this._max)
			} else {
				a = c = new ClosedInterval(this._min, this._max)
			}
		}
		let b: OpenInterval = (a.UPPER < c.LOWER) ? new OpenInterval(a.UPPER, c.LOWER) : new OpenInterval(0, 0)
		let preferences: ReadonlyMap<Interval, number>|null =
			(a.equals(c)     ) ? new Map<Interval, number>([[a, 1                         ], [b, 1], [c, 1                         ]]) :
			(a.has(this._opt)) ? new Map<Interval, number>([[a, 1                         ], [b, 2], [c, b.LENGTH.equals(0) ? 2 : 3]]) :
			(c.has(this._opt)) ? new Map<Interval, number>([[a, b.LENGTH.equals(0) ? 2 : 3], [b, 2], [c, 1                         ]]) :
			(b.has(this._opt)) ? new Map<Interval, number>([[a, 2                         ], [b, 1], [c, 2                         ]]) :
			null
		return (preferences !== null) ? [a, b, c].map((iv) => ({
			interval: [iv.LOWER, iv.UPPER] as [number, number],
			preference: preferences !.get(iv) !
		})) : null
	}
}
