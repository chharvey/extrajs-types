import * as xjs from 'extrajs'

import Length from './Length.class'


/**
 * An Interval is a set, a range of real numbers, with a lower bound and an upper bound.
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
	 * @param   r a tuple: `[lower, upper]`
	 */
	constructor(r: [number, number]) {
		this.LOWER = r[0]
		this.UPPER = r[1]
	}

	/**
	 * Determine whether a given (finite) number is within this Interval.
	 * @param   x the finite number to test
	 * @returns is the argument in this interval?
	 */
	abstract contains(x: number): boolean;

	/**
	 * Determine whether this Interval is the “same as” the argument.
	 *
	 * Intervals are “the same”, or “equal”, when they contain exactly the same numbers.
	 * @param   iv the Interval to test
	 * @returns does this Interval contain exactly the same numbers as the argument?
	 */
	equals(iv: Interval): boolean {
		return xjs.Array.is([this.LOWER, this.UPPER], [iv.LOWER, iv.UPPER])
			&& (this.contains(this.LOWER) === iv.contains(iv.LOWER))
			&& (this.contains(this.UPPER) === iv.contains(iv.UPPER))
	}
}
/**
 * An open interval is denoted `(l, u)`, and contains all the numbers `x` such that
 * `l < x && x < u`.
 */
export class OpenInterval extends Interval {
	/**
	 * Construct a new OpenInterval object.
	 * @param   r a tuple: `[lower, upper]`
	 */
	constructor(r: [number, number]) { super(r) }
	/** @implements Interval */
	contains(x: number): boolean {
		xjs.Number.assertType(x, 'finite')
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
	 * @param   r a tuple: `[lower, upper]`
	 */
	constructor(r: [number, number]) { super(r) }
	/** @implements Interval */
	contains(x: number): boolean {
		xjs.Number.assertType(x, 'finite')
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
	 * @param   r a tuple: `[lower, upper]`
	 */
	constructor(r: [number, number]) { super(r) }
	/** @implements Interval */
	contains(x: number): boolean {
		xjs.Number.assertType(x, 'finite')
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
	 * @param   r a tuple: `[lower, upper]`
	 */
	constructor(r: [number, number]) { super(r) }
	/** @implements Interval */
	contains(x: number): boolean {
		xjs.Number.assertType(x, 'finite')
		return this.LOWER <= x && x < this.UPPER
	}
}
