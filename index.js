const Angle_module    = require('./dist/class/Angle.class.js')
const Color_module    = require('./dist/class/Color.class.js')
const Duration_module = require('./dist/class/Duration.class.js')
const Interval_module = require('./dist/class/Interval.class.js')
const Length_module   = require('./dist/class/Length.class.js')

module.exports = {
	Angle        : Angle_module.default,
	AngleUnit    : Angle_module.AngleUnit,
	Color        : Color_module.default,
	ColorSpace   : Color_module.ColorSpace,
	Duration     : Duration_module.default,
	DurationUnit : Duration_module.LengthUnit,
	Fraction     : require('./dist/class/Fraction.class.js').default,
	Integer      : require('./dist/class/Integer.class.js' ).default,
	Length       : Length_module.default,
	LengthUnit   : Length_module.LengthUnit,
	Matrix       : require('./dist/class/Matrix.class.js'      ).default,
	MatrixSquare : require('./dist/class/MatrixSquare.class.js').default,
	Meter        : require('./dist/class/Meter.class.js'       ).default,
	MeterInt     : require('./dist/class/MeterInt.class.js'    ).default,
	Percentage   : require('./dist/class/Percentage.class.js'  ).default,
	Rational     : require('./dist/class/Rational.class.js'    ).default,
	TreeNode     : require('./dist/class/TreeNode.class.js'    ).default,
	TreeNodePre  : require('./dist/class/TreeNodePre.class.js' ).default,
	TreeNodePost : require('./dist/class/TreeNodePost.class.js').default,
	TreeNodeBreadth: require('./dist/class/TreeNodeBreadth.class.js').default,
	Vector       : require('./dist/class/Vector.class.js'      ).default,

	Interval              : Interval_module.Interval,
	OpenInterval          : Interval_module.OpenInterval,
	ClosedInterval        : Interval_module.ClosedInterval,
	HalfOpenLeftInterval  : Interval_module.HalfOpenLeftInterval,
	HalfOpenRightInterval : Interval_module.HalfOpenRightInterval,
}
