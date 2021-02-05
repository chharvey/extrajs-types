import * as xjs from 'extrajs'

import Integer from './Integer.class'
import Vector from './Vector.class'


/**
 * A Matrix is an immutable two-dimensional array of numbers.
 *
 * Matrices have a finite natural number of rows and columns,
 * where each entry at a given row and column is called a **cell**.
 * An empty matrix is a matrix with 0 rows and columns (and thus 0 cells).
 * Each matrix cell is a finite number (any primitive JavaScript number that is not `Infinity`, `-Infinity`, or `NaN`).
 * The **height** and **width** of a matrix are the respective ‘lengths’ of its rows and columns.
 * For example, a matrix with 3 rows and 2 columns has a height of 3, and a width of 2.
 *
 * A **Matrix Space** is a set of Matrices within a constant dimension. It has the following properties:
 *
 * - Matrices are closed under addition, subtraction, and scalar multiplication:
 * 	For matrices `a` and `b` of dimension *N×M*, and for scalar `K`,
 * 	the expressions `a + b`, `a - b`, and `K * a` are guaranteed to also be matrices of dimension *N×M*.
 * - A Matrix Space has a (unique) additive identity:
 * 	There exists a matrix `0` such that for every matrix `a`,
 * 	`a + 0` and `0 + a` are guaranteed to equal `a`, and
 * 	`0` is the only matrix with this property.
 * - Matrices in a Matrix Space have (unique) additive inverses:
 * 	For every matrix `a`, a unique matrix `-a` is guaranteed such that `a + -a === -a + a === 0`
 * 	(where `0` is the additive identity).
 * - Addition is commutative and associative:
 * 	For matrices `a`, `b`, and `c`, the following statements are guaranteed true:
 * 	- `a + b === b + a`
 * 	- `a + (b + c) === (a + b) + c`
 * - Scalar-Multiplication is associative:
 * 	For matrix `a`, and scalars `K` and `J`, we are guaranteed `J * (K * a) === (J * K) * a`.
 * - Scalar-Multiplication distributes over addition:
 * 	For matrices `a`, `b`, and scalar `K`, we are guaranteed `K * (a + b) === K * a + K * b`.
 *
 * ## Matrix Multiplication
 *
 * Some Matrices can be multiplied. If matrix `a` has dimension *M×N*, and matrix `b` has dimension *N×P*,
 * then the **product** matrix, `ab`, exists and will have dimension *M×P*.
 *
 * Matrix Multiplication is associative:
 * 	For matrices `a` (*M×N*), `b` (*N×P*), and `c` (*P×Q*), compatible for multiplication,
 * 	we are guaranteed `a(bc) === (ab)c`.
 * 	Note, however, that although both sides of the equation are equal,
 * 	the time it takes to compute each product is not necessarily the same. For details, read
 * 	{@link https://www.johndcook.com/blog/2017/12/12/efficiency-is-not-associative-for-matrix-multiplication/|“Efficiency is not associative for matrix multiplication”}
 * 	by John D Cook.
 */
export default class Matrix {
	/**
	 * Assert two matrices have the same dimension.
	 * @param   matrix1 matrix1
	 * @param   matrix2 matrix2
	 * @param   message a message for the error
	 * @throws  {TypeError} if the assertion fails
	 */
	static assertSameDimensions(matrix1: Matrix, matrix2: Matrix, message: string = 'Matrix dimensions are not equal.'): void {
		if (
			   matrix1.height !== matrix2.height
			|| matrix1.width  !== matrix2.width
		) {
			throw new TypeError(message);
		};
	}

	/**
	 * Return a new additive identity Matrix object by specifying its size.
	 *
	 * The returned matrix’s cells will all be 0.
	 * @param   rows the number of rows in the Matrix (its height)
	 * @param   cols the number of columns in the Matrix (its width)
	 */
	static addIden(rows: Integer|number = 0, cols: Integer|number = rows): Matrix {
		return (rows instanceof Integer && cols instanceof Integer) ?
			new Matrix(new Array(rows.valueOf()).fill([]).map((_row: number[]) =>
				new Array(cols.valueOf()).fill(0)
			)) : Matrix.addIden(new Integer(rows), new Integer(cols))
	}


	/**
	 * The cells of this Matrix.
	 */
	protected readonly _DATA: readonly (readonly number[])[];
	/**
	 * The height of this Matrix.
	 */
	private readonly _HEIGHT: bigint;
	/**
	 * The width of this Matrix.
	 */
	private readonly _WIDTH: bigint;

	/**
	 * Construct a new Matrix object.
	 * @param   data a Matrix, an array of Vectors, or array of arrays of finite numbers
	 */
	constructor(data: Matrix|readonly (Vector|number[])[] = []) {
		let rawdata: readonly number[][] = (data instanceof Matrix) ?
			data.raw.map((row) => [...row]) : // each row must be a full Array
			data.map((row) => (row instanceof Vector) ? [...row.raw] : row) // each row must be a full Array
		const maxwidth: number = Math.max(...rawdata.map((row) => row.length), 0)
		rawdata.forEach((row) => {
			row.length = maxwidth // add extra `undefined`s (if less) or removes extra entries (if more)
			row = xjs.Array.fillHoles(row, 0)
		})
		this._DATA = rawdata
		this._HEIGHT = BigInt(rawdata.length);
		this._WIDTH  = BigInt(maxwidth);
	}

	/**
	 * Get this Matrix’s raw data: the cells.
	 * @returns this Matrix’s raw data
	 */
	get raw(): readonly (readonly number[])[] {
		return this._DATA.slice()
	}

	/**
	 * Get this Matrix’s height, the number of rows in this Matrix.
	 * @returns the length of the array provided in construction
	 */
	get height(): bigint {
		return this._HEIGHT
	}

	/**
	 * Get this Matrix’s width, the number of columns in this Matrix.
	 * @returns the length of each row
	 */
	get width(): bigint {
		return this._WIDTH
	}

	/**
	 * Get the negation of this Matrix.
	 *
	 * The negation of a Matrix is its additive inverse:
	 * the Matrix that when added to this, gives a sum of 0 (the additive identity).
	 * @returns a new Matrix representing the additive inverse
	 */
	get negation(): Matrix {
		return new Matrix(this._DATA.map((row) => new Vector(row).negation))
	}

	/**
	 * Get the transposition of this Matrix.
	 *
	 * The transposition of an N×M matrix `a` is a new M×N matrix `b`,
	 * such that the row and column indices of the cells of `a` have been flipped.
	 *
	 * Example:
	 * ```
	 * let m = new Matrix([
	 * 	[ 1, 2, 3 ],
	 * 	[ 4, 5, 6 ],
	 * ])
	 * m.transpose // returns a new 3×2 matrix:
	 * // [
	 * // 	[1, 4],
	 * // 	[2, 5],
	 * // 	[3, 6],
	 * // ]
	 * ```
	 * @returns the transposition of this Matrix
	 */
	get transposition(): Matrix {
		return this.subMatrix(
			this._DATA   .map((_row, i) => i).reverse(),
			this._DATA[0].map((_col, j) => j).reverse(),
		)
	}


	/** @override Object */
	toString() {
		return `⟨${this._DATA.map((row) => new Vector(row).toString()).join(',\n')}⟩`
	}

	/**
	 * Return the `i`th-`j`th cell of this Matrix, if it exists.
	 * @param   i the row-index of the cell to get
	 * @param   j the column-index of the cell to get
	 * @returns the value at the `i`th-`j`th entry
	 * @throws  {RangeError} if `i` is out of bounds
	 * @throws  {RangeError} if `j` is out of bounds
	 */
	at(i: Integer|number, j: Integer|number): number {
		if (i instanceof Integer && j instanceof Integer) {
			if (i.lessThan(0) || !i.lessThan(Number(this.height))) throw new xjs.IndexOutOfBoundsError(i.valueOf());
			if (j.lessThan(0) || !j.lessThan(Number(this.width) )) throw new xjs.IndexOutOfBoundsError(j.valueOf());
			return this._DATA[i.valueOf()][j.valueOf()]
		} else return this.at(new Integer(i), new Integer(j))
	}

	/**
	 * Return a single row of this matrix.
	 * @param   i the index of the row to get
	 * @returns the row of entries
	 * @throws  {RangeError} if `i` is out of bounds
	 */
	getRow(i: Integer|number): Vector {
		if (i instanceof Integer) {
			if (i.lessThan(0) || !i.lessThan(Number(this.height))) {
				throw new xjs.IndexOutOfBoundsError(i.valueOf());
			};
			return new Vector(this._DATA[i.valueOf()])
		} else return this.getRow(new Integer(i))
	}

	/**
	 * Return a single column of this matrix.
	 * @param   j the index of the column to get
	 * @returns the column of entries
	 * @throws  {RangeError} if `j` is out of bounds
	 */
	getCol(j: Integer|number): Vector {
		if (j instanceof Integer) {
			if (j.lessThan(0) || !j.lessThan(Number(this.width))) {
				throw new xjs.IndexOutOfBoundsError(j.valueOf());
			};
			let col: number[] = []
			this._DATA.forEach((row) => {
				col.push(row[j.valueOf()])
			})
			return new Vector(col)
		} else return this.getCol(new Integer(j))
	}

	/**
	 * Return a subset of cells in this Matrix.
	 *
	 * The returned matrix is a new matrix, containing only the rows and columns specified.
	 * The only cells in the returned matrix are in both the specified rows and columns;
	 * that is, the indices of each returned cell are present in both arguments.
	 * Note that the order of indices in each list is relevant.
	 *
	 * Example:
	 * ```
	 * let m = new Matrix([
	 * 	[ 1, 2, 3 ],
	 * 	[ 4, 5, 6 ],
	 * 	[ 7, 8, 9 ],
	 * ])
	 * m.subMatrix([0,2], [1]) // returns a new 2×1 matrix:
	 * // [
	 * // 	[2],
	 * // 	[8],
	 * // ]
	 * m.subMatrix([2,0], [2,1]) // returns a new 2×2 matrix: note the order of rows/columns:
	 * // [
	 * // 	[9, 8],
	 * // 	[3, 2],
	 * // ]
	 * ```
	 * @param   rows a list of row    indices to include
	 * @param   cols a list of column indices to include
	 * @returns a new Matrix containg only the cells in this Matrix of the listed indices
	 */
	subMatrix(rows: (Integer|number)[], cols: (Integer|number)[]): Matrix {
		const matrix: number[][] = []
		rows.forEach((rowindex) => {
			const row: number[] = []
			cols.forEach((colindex) => {
				row.push(this.at(rowindex, colindex))
			})
			matrix.push(row)
		})
		return new Matrix(matrix)
	}

	/**
	 * Return a minor of this Matrix, a submatrix excluding a single specified row and column.
	 *
	 * Helpful when calculating determinants and reciprocals.
	 * @param   row the index of the row to exclude
	 * @param   col the index of the column to exclude
	 * @returns a new Matrix containing all rows and columns except those specified
	 */
	minor(row: Integer|number, col: Integer|number): Matrix {
		const rowindices: number[] = Array.from(new Array(Number(this.height)), (_, i) => i); // [0, 1, 2, ..., this.height - 1]
		const colindices: number[] = Array.from(new Array(Number(this.width )), (_, j) => j); // [0, 1, 2, ..., this.width  - 1]
		if (row instanceof Integer && col instanceof Integer) {
			let rows: number[] = rowindices.slice(0, row.valueOf()).concat(rowindices.slice(row.plus(1).valueOf()))
			let cols: number[] = colindices.slice(0, col.valueOf()).concat(colindices.slice(col.plus(1).valueOf()))
			return this.subMatrix(rows, cols)
		} else return this.minor(new Integer(row), new Integer(col))
	}

	/**
	 * Return whether this Matrix equals the argument.
	 * Matrices are equal if and only if their corresponding cells are equal.
	 * @param   matrix the Matrix to compare
	 * @returns does this Matrix equal the argument?
	 * @throws  {TypeError} if the argument is not of the correct dimension
	 */
	equals(matrix: Matrix|number[][]): boolean {
		if (this === matrix) return true
		return (matrix instanceof Matrix) ? (
			Matrix.assertSameDimensions(this, matrix, 'Matrix dimensions are incompatible for equality.'),
			this._DATA.every((row, i) => new Vector(row).equals(new Vector(matrix._DATA[i])))
		) : this.equals(new Matrix(matrix))
	}

	/**
	 * Add this Matrix (the augend) to another (the addend).
	 * @param   addend the Matrix to add to this one
	 * @returns a new Matrix representing the sum, `augend + addend`
	 * @throws  {TypeError} if the argument is not of the correct dimension
	 */
	plus(addend: Matrix|number[][]): Matrix {
		return (addend instanceof Matrix) ? (
			Matrix.assertSameDimensions(this, addend, 'Matrix dimensions are incompatible for addition.'),
			new Matrix(this._DATA.map((row, i) => new Vector(row).plus(new Vector(addend._DATA[i]))))
		) : this.plus(new Matrix(addend))
	}

	/**
	 * Subtract another Matrix (the subtrahend) from this (the minuend).
	 *
	 * Note that subtraction is not commutative: `a - b` does not always equal `b - a`.
	 * @param   subtrahend the Matrix to subtract from this one
	 * @returns a new Matrix representing the difference, `minuend - subtrahend`
	 */
	minus(subtrahend: Matrix|number[][]): Matrix {
		return (subtrahend instanceof Matrix) ?
			this.plus(subtrahend.scale(-1)) :
			this.minus(new Matrix(subtrahend))
	}

	/**
	 * Scale this Matrix by a scalar factor.
	 *
	 * Multiply each cell of this Matrix by a scalar.
	 * @param   scalar the scale factor
	 * @returns a new Matrix representing the product
	 */
	scale(scalar: number = 1): Matrix {
		return new Matrix(this._DATA.map((row) => new Vector(row).scale(scalar)))
	}

	/**
	 * Multiply this Matrix (the multiplicand) by another (the multiplier).
	 *
	 * Note that multiplication is not closed: `ab` might not exist.
	 * Note that multiplication is not commutative: `ab` does not always equal `ba`; in fact `ba` might not even exist.
	 * @param   multiplier the Matrix to multiply this one by
	 * @returns a new Matrix representing the product, `multiplicand * multiplier`
	 * @throws  {TypeError} if the argument is not of the correct dimension
	 */
	times(multiplier: Matrix|number[][]): Matrix {
		if (multiplier instanceof Matrix) {
			if (this.width !== multiplier.height) {
				throw new RangeError('Matrix dimensions are incompatible for multiplication.');
			};
			const matrix: number[][] = []
			this._DATA.forEach((_row, i) => {
				const newrow: number[] = []
				this._DATA[0].forEach((_col, j) => {
					newrow.push(this.getRow(i).dot(multiplier.getCol(j)))
				})
				matrix.push(newrow)
			})
			return new Matrix(matrix)
		} else return this.times(new Matrix(multiplier))
	}
}
