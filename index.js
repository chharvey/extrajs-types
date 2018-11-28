const Angle_module = require('./dist/class/Angle.class.js')
const Color_module = require('./dist/class/Color.class.js')

module.exports = {
	Integer    : require('./dist/class/Integer.class.js').default,
	Percentage : require('./dist/class/Percentage.class.js').default,
	Angle      : Angle_module.default,
	AngleUnit  : Angle_module.AngleUnit,
	Color      : Color_module.default,
	ColorSpace : Color_module.ColorSpace,
}
