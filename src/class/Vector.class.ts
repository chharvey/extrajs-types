import * as xjs from 'extrajs'

import Integer from './Integer.class'
import MatrixSquare_import from './MatrixSquare.class'


/**
 * A Vector is a one-dimensional array of numbers.
 *
 * Vectors have a finite natural number of entries, called **coordinates**.
 * An empty vector is a vector with 0 coordinates.
 * Each vector entry is a finite number (any primitive JavaScript number that is not `Infinity`, `-Infinity`, or `NaN`).
 * The ‘length’ of a vector is called its **dimension**.
 * For example, a vector with 3 coordinates is three-dimensional.
 *
 * A **Vector Space** is a set of Vectors within a constant dimension. It has the following properties:
 *
 * - Vectors are closed under addition, subtraction, and scalar multiplication.
 * 	For vectors `a` and `b` of dimension *N*, and for scalar `K`,
 * 	the expressions `a + b`, `a - b`, and `K * a` are guaranteed to also be vectors of dimension *N*.
 * - A Vector Space has a (unique) additive idenity.
 * 	There exists a vector `0` such that for every vector `a`,
 * 	`a + 0` and `0 + a` are guaranteed to equal `a`, and
 * 	`0` is the only vector with this property.
 * - Vectors have (unique) additive inverses:
 * 	for every vector `a`, a unique vector `-a` is guaranteed such that `a + -a === -a + a === 0`
 * 	(where `0` is the additive identity).
 * - Addition is commutative and associative.
 * 	For vectors `a`, `b`, and `c`, the following statments are guaranteed true:
 * 	- `a + b === b + a`
 * 	- `a + (b + c) === (a + b) + c`
 * - Scalar-Multiplication is associative.
 * 	For vector `a`, and scalars `K` and `J`, we are guaranteed `J * (K * a) === (J * K) * a`.
 * - Scalar-Multiplication distributes over addition.
 * 	For vectors `a`, `b`, and scalar `K`, we are guaranteed `K * (a + b) === K * a + K * b`.
 */
export default class Vector {
	/**
	 * Assert two vectors have the same dimension.
	 * @param   vector1 vector1
	 * @param   vector2 vector2
	 * @param   message a message for the error
	 * @throws  {TypeError} if the assertion fails
	 */
	static assertSameDimensions(vector1: Vector, vector2: Vector, message: string = 'Vector dimensions are not equal.'): void {
		if (!vector1.dimension.equals(vector2.dimension)) throw new TypeError(message)
	}

	/**
	 * The coordinates of this Vector.
	 */
	private readonly _DATA: ReadonlyArray<number>;
	/**
	 * The dimension of this Vector.
	 */
	private readonly _DIMENSION: Integer;

	/**
	 * Construct a new Vector object.
	 * @param   data a Vector or array of finite numbers
	 */
	constructor(data: Vector|ReadonlyArray<number> = []) {
		if (data instanceof Vector) data = data.raw
		data.forEach((c) => xjs.Number.assertType(c, 'finite'))
		this._DATA = data
		this._DIMENSION = new Integer(data.length)
	}

	/**
	 * Get this Vector’s raw data: the list of coordinates.
	 * @returns this Vector’s raw data
	 */
	get raw(): ReadonlyArray<number> {
		return this._DATA.slice()
	}

	/**
	 * Get the dimension of this Vector: how many coordinates this Vector has.
	 * @returns this Vector’s dimension
	 */
	get dimension(): Integer {
		return this._DIMENSION
	}

	/**
	 * Get the magnitude of this Vector as a raw value.
	 * @returns this Vector’s magnitude
	 */
	get magnitude(): number {
		return Math.sqrt(this.dot(this))
	}

	/**
	 * Get the negation of this Vector.
	 *
	 * The negation of a Vector is its additive inverse:
	 * the Vector that when added to this, gives a sum of 0 (the additive identity).
	 * @returns a new Vector representing the additive inverse
	 */
	get negation(): Vector {
		return this.scale(-1)
	}

	/**
	 * Get the unit vector corresponding to this Vector.
	 *
	 * A unit vector has magnitude 1 but otherwise preserves direction.
	 * @returns this Vector’s unit
	 */
	get unit(): Vector {
		return this.scale(1/this.magnitude)
	}

	/** @override */
	toString() {
		return `⟨${this._DATA.join(', ')}⟩`
	}

	/**
	 * Return the `i`th coordinate of this Vector, if it exists.
	 * @param   i the index of the coordinate to get
	 * @returns the value at the `i`th entry
	 * @throws  {RangeError} if `i` is out of bounds
	 */
	at(i: Integer|number): number {
		if (i instanceof Integer) {
			if (i.lessThan(0) || !i.lessThan(this.dimension)) throw new RangeError(`Index ${i} out of bounds.`)
			return this._DATA[i.valueOf()]
		} else return this.at(new Integer(i))
	}

	/**
	 * Return whether this Vector equals the argument.
	 * Vectors are equal if and only if their corresponding coordinates are equal.
	 * @param   vector the Vector to compare
	 * @returns does this Vector equal the argument?
	 * @throws  {TypeError} if the argument is not of the correct dimension
	 */
	equals(vector: Vector|number[]): boolean {
		if (this === vector) return true
		return (vector instanceof Vector) ? (
			Vector.assertSameDimensions(this, vector, 'Vector dimensions are incompatible for equality.'),
			this._DATA.every((coord, i) => coord === vector.at(i))
		) : this.equals(new Vector(vector))
	}

	/**
	 * Add this Vector (the augend) to another (the addend).
	 * @param   addend the Vector to add to this one
	 * @returns a new Vector representing the sum, `augend + addend`
	 * @throws  {TypeError} if the argument is not of the correct dimension
	 */
	plus(addend: Vector|number[]): Vector {
		return (addend instanceof Vector) ? (
			Vector.assertSameDimensions(this, addend, 'Vector dimensions are incompatible for addition.'),
			new Vector(this._DATA.map((coord, i) => coord + addend.at(i)))
		) : this.plus(new Vector(addend))
	}

	/**
	 * Subtract another Vector (the subtrahend) from this (the minuend).
	 *
	 * Note that subtraction is not commutative: `a - b` does not always equal `b - a`.
	 * @param   subtrahend the Vector to subtract from this one
	 * @returns a new Vector representing the difference, `minuend - subtrahend`
	 */
	minus(subtrahend: Vector|number[]): Vector {
		return (subtrahend instanceof Vector) ?
			this.plus(subtrahend.scale(-1)) :
			this.minus(new Vector(subtrahend))
	}

	/**
	 * Scale this Vector by a scalar factor.
	 *
	 * If the scale factor is <1, returns a new Vector ‘longer’  than this Vector.
	 * If the scale factor is >1, returns a new Vector ‘shorter’ than this Vector.
	 * If the scale factor is =1, returns a new Vector equal to       this Vector.
	 * If the scale factor is negative, returns a negative Vector:
	 * for example, `(60).scale(-2)` returns `-120`.
	 * @param   scalar the scale factor
	 * @returns a new Vector representing the product
	 */
	scale(scalar: number = 1): Vector {
		return new Vector(this._DATA.map((coord) => scalar * coord))
	}

	/**
	 * Return the dot product of this Vector (the multiplicand) and another (the multiplier).
	 *
	 * The [Dot Product](https://en.wikipedia.org/wiki/Dot_product) formula:
	 * ```
	 *   N
	 *  ⎲   (A_i * B_i)
	 *  ⎳
	 * i=0
	 * ```
	 *
	 * Example:
	 * ```
	 * new Vector([2,4,6]).dot(new Vector([7,5,3]))  //  returns 52 (equal to 14 + 20 + 18)
	 * ```
	 *
	 * @param   multiplier the Vector to dot with this
	 * @returns a scalar value representing the dot product, `multiplicand • multiplier`
	 * @throws  {TypeError} if the argument is not of the correct dimension
	 */
	dot(multiplier: Vector): number {
		Vector.assertSameDimensions(this, multiplier, 'Vector dimensions are incompatible for dot product.')
		return this._DATA.map((coord, i) => coord * multiplier.at(new Integer(i))).reduce((a, b) => a + b)
	}

	/**
	 * Return the cross product of this Vector (the multiplicand) with another (the multiplier).
	 *
	 * [Cross Product](https://en.wikipedia.org/wiki/Cross_product)
	 *
	 * **Both Vectors must have a dimension of exactly 3.**
	 * @param   multiplier the Vector to cross with this
	 * @returns a new Vector representing the cross product, `multiplicand × multiplier`
	 * @throws  {TypeError} if `this` or the argument are not of the correct dimension
	 */
	cross(multiplier: Vector): Vector {
		if (!this.dimension.equals(3) || !multiplier.dimension.equals(3)) throw new TypeError('Vector dimensions are incompatible for cross product.')
		const MatrixSquare: typeof MatrixSquare_import = require('./MatrixSquare.class.js').default // NB relative to dist
		return new Vector([
			new MatrixSquare([
				[this      .at(1), this      .at(2)],
				[multiplier.at(1), multiplier.at(2)],
			]).det,
			-1 * new MatrixSquare([
				[this      .at(0), this      .at(2)],
				[multiplier.at(0), multiplier.at(2)],
			]).det,
			new MatrixSquare([
				[this      .at(0), this      .at(1)],
				[multiplier.at(0), multiplier.at(1)],
			]).det,
		])
	}
}
