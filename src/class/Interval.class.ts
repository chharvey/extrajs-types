import * as xjs from 'extrajs'

import Length from './Length.class'


/**
 * An Interval is an immutable set, a range of real numbers, with a constant lower bound and upper bound.
 *
 * Note that `Infinity` and `-Infinity` may be used as bounds,
 * but only for {@link OpenInterval|open-ended intervals}.
 */
export abstract class Interval {
	/** The lower bound of this Interval. */
	readonly LOWER: number;
	/** The upper bound of this Interval. */
	readonly UPPER: number;
	/** The length of this Interval. */
	readonly LENGTH: Length = new Length(this.UPPER - this.LOWER)

	/**
	 * Construct a new Interval object.
	 * @param   lower the lower bound
	 * @param   upper the upper bound
	 */
	constructor(lower: number, upper: number) {
		this.LOWER = lower
		this.UPPER = upper
	}

	/**
	 * Subclass operations of {@link Interval#has}
	 * @param   x the finite number to test
	 * @returns is the argument in this interval?
	 */
	protected abstract _doHas(x: number): boolean;
	/**
	 * Determine whether a given (finite) number is within this Interval.
	 * @final
	 * @param   x the finite number to test
	 * @returns is the argument in this interval?
	 */
	has(x: number): boolean {
		xjs.Number.assertType(x, 'finite')
		return this._doHas(x)
	}

	/**
	 * Determine whether this Interval is the “same as” the argument.
	 *
	 * Intervals are “the same”, or “equal”, when they contain exactly the same member numbers.
	 * @param   iv the Interval to test
	 * @returns does this Interval have exactly the same members as the argument?
	 */
	equals(iv: Interval): boolean {
		if (this === iv) return true
		return xjs.Array.is([this.LOWER, this.UPPER], [iv.LOWER, iv.UPPER])
			&& (this.has(this.LOWER) === iv.has(iv.LOWER))
			&& (this.has(this.UPPER) === iv.has(iv.UPPER))
	}
}
/**
 * An open interval is denoted `(l, u)`, and contains all the numbers `x` such that
 * `l < x && x < u`.
 */
export class OpenInterval extends Interval {
	/**
	 * Construct a new OpenInterval object.
	 * @param   lower the lower bound
	 * @param   upper the upper bound
	 */
	constructor(lower: number, upper: number) { super(lower, upper) }
	/** @implements Interval */
	protected _doHas(x: number): boolean {
		return this.LOWER < x && x < this.UPPER
	}
}
/**
 * A closed interval is denoted `[l, u]`, and contains all the numbers `x` such that
 * `l <= x && x <= u`.
 */
export class ClosedInterval extends Interval {
	/**
	 * Construct a new ClosedInterval object.
	 * @param   lower the lower bound
	 * @param   upper the upper bound
	 */
	constructor(lower: number, upper: number) { super(lower, upper) }
	/** @implements Interval */
	protected _doHas(x: number): boolean {
		return this.LOWER <= x && x <= this.UPPER
	}
}
/**
 * A half-open-left interval is denoted `(l, u]`, and contains all the numbers `x` such that
 * `l < x && x <= u`.
 */
export class HalfOpenLeftInterval extends Interval {
	/**
	 * Construct a new HalfOpenLeftInterval object.
	 * @param   lower the lower bound
	 * @param   upper the upper bound
	 */
	constructor(lower: number, upper: number) { super(lower, upper) }
	/** @implements Interval */
	protected _doHas(x: number): boolean {
		return this.LOWER < x && x <= this.UPPER
	}
}
/**
 * A half-open-right interval is denoted `[l, u)`, and contains all the numbers `x` such that
 * `l <= x && x < u`.
 */
export class HalfOpenRightInterval extends Interval {
	/**
	 * Construct a new HalfOpenRightInterval object.
	 * @param   lower the lower bound
	 * @param   upper the upper bound
	 */
	constructor(lower: number, upper: number) { super(lower, upper) }
	/** @implements Interval */
	protected _doHas(x: number): boolean {
		return this.LOWER <= x && x < this.UPPER
	}
}
