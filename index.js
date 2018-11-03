const Angle_module = require('./dist/class/Angle.class.js')

module.exports = {
	Integer    : require('./dist/class/Integer.class.js').default,
	Percentage : require('./dist/class/Percentage.class.js').default,
	Angle      : Angle_module.default,
	AngleUnit  : Angle_module.AngleUnit,
}
