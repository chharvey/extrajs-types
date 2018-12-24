import Integer from './Integer.class'
import Matrix from './Matrix.class'


/**
 * A MatrixSquare, a Square Matrix, is a {@link Matrix} whose rows and columns are equal in number.
 *
 * A **Square Matrix Space** is a matrix space whose row dimension and column dimension are equal.
 *
 * - Matrices in a Square Matrix Space are closed under multiplication.
 * 	For matrices `a` and `b` of dimension *N×N*,
 * 	the expression `ab` is guaranteed to also be a matrix of dimension *N×N*.
 * - A Square Matrix Space has a (unique) multiplicative idenity.
 * 	There exists a matrix `1` such that for every matrix `a`,
 * 	`a1`, and `1a` are guaranteed to equal `a`, and
 * 	`1` is the only matrix with this property.
 * - Matrices in a Square Matrix Space have (unique) multiplicative inverses:
 * 	for every matrix `a`, a unique matrix `a’` is guaranteed such that `aa’ === a’a === 1`
 * 	(where `1` is the multiplicative identity).
 * - Matrices in a Square Matrix Space have a (unique) multiplicative absorber:
 * 	a unique matrix `0` is guaranteed such that for every matrix `a`, `a0 === 0a === 0`.
 * 	(In a Square Matrix Space, the multiplicative absorber and the additive identity are one in the same.)
 */
export default class MatrixSquare extends Matrix {
	/**
	 * Construct a new MatrixSquare object.
	 * @param   arr an array of arrays of finite numbers
	 * @throws  {TypeError} if the given array is not square
	 */
	constructor(arr: ReadonlyArray<number[]> = [[]]) {
		super(arr)
		if (!this.height.equals(this.width)) throw new TypeError('The argument to `MatrixSquare.constructor` must be a square array.')
	}

	/**
	 * The transposition of a square matrix is always a square matrix.
	 * @override
	 */
	get transposition(): MatrixSquare {
		return super.transposition as MatrixSquare
	}

	/**
	 * Get this matrix’s size, the number of rows and columns in this matrix.
	 * @returns `this.height` or `this.width` — they are equal
	 */
	get size(): Integer {
		return this.height
	}

	/**
	 * Get the determinant of this MatrixSquare.
	 * @returns the determinant of this MatrixSquare
	 * @throws  {TypeError} if this MatrixSquare is empty
	 */
	get det(): number {
		if (this.size.equals(0)) throw new TypeError('Determinant of an empty matrix is undefined.')
		if (this.size.equals(1)) return this.at(0,0)
		return this._DATA[0].map((cell, j) =>
			((j % 2 === 0) ? 1 : -1) * cell * this.minor(0, j).det
		).reduce((a, b) => a + b)
	}

	/**
	 * Get the reciprocal of this MatrixSquare.
	 *
	 * The reciprocal of a MatrixSquare is its multiplicative inverse:
	 * the MatrixSquare that when multiplied to this, gives a product of 1 (the multiplicative identity).
	 * @returns a new MatrixSquare representing the multiplicative inverse
	 * @throws  {TypeError} if this MatrixSquare is empty
	 * @throws  {TypeError} if the determinant of this MatrixSquare is 0
	 */
	get reciprocal(): MatrixSquare {
		if (this.det === 0) throw new TypeError('A matrix whose determinant is 0 has no reciprocal.')
		if (this.size.equals(0)) return new MatrixSquare()
		if (this.size.equals(1)) return new MatrixSquare([[1 / this.det]])
		return new MatrixSquare(this._DATA.map((row, i) =>
			row.map((_cell, j) => (((i+j) % 2 === 0) ? 1 : -1) * this.transposition.minor(i, j).det) // NB transposed on purpose; see <http://mathworld.wolfram.com/MatrixInverse.html>
		)).scale(1 / this.det)
	}

	/**
	 * The minor of a square matrix is always a square matrix.
	 * @override
	 */
	minor(row: Integer|number, col: Integer|number): MatrixSquare {
		return super.minor(row, col) as MatrixSquare
	}

	/**
	 * Scaling a square matrix always yields a square matrix.
	 * @override
	 */
	scale(scalar: number = 1): MatrixSquare {
		return super.scale(scalar) as MatrixSquare
	}
}
