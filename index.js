const Length_module = require('./dist/class/Length.class.js')
const Angle_module = require('./dist/class/Angle.class.js')
const Color_module = require('./dist/class/Color.class.js')

module.exports = {
	Integer    : require('./dist/class/Integer.class.js').default,
	Fraction   : require('./dist/class/Fraction.class.js').default,
	Percentage : require('./dist/class/Percentage.class.js').default,
	Vector     : require('./dist/class/Vector.class.js').default,
	Matrix     : require('./dist/class/Matrix.class.js').default,
	MatrixSquare : require('./dist/class/MatrixSquare.class.js').default,
	Length     : Length_module.default,
	LengthUnit : Length_module.LengthUnit,
	Angle      : Angle_module.default,
	AngleUnit  : Angle_module.AngleUnit,
	Color      : Color_module.default,
	ColorSpace : Color_module.ColorSpace,
}
