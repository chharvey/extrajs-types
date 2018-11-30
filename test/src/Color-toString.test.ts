import {Color, ColorSpace} from '../../index'
import test from './test'


export default Promise.all([
	test(new Color(0.25, 0.5, 1       ).toString(), '#4080ff'),
	test(new Color(0.25, 0.5, 1       ).toString(ColorSpace.HWB), 'hwb(0.611111111111111turn 25% 0%)'),
	test(new Color(0.5 , 0.5, 0.5, 0.5).toString(ColorSpace.HWB), 'hwb(0turn 50% 50% / 0.5)'),
	test(new Color(                   ).toString(ColorSpace.HWB), 'hwb(0turn 0% 100% / 0)'),
	test(new Color(0.5 , 0.1, 0.9     ).toString(ColorSpace.HSL), 'hsl(0.75turn 80% 50%)'),
	test(Color.fromString('#e4f0f6'   ).toString(ColorSpace.HWB), 'hwb(0.5555555555555557turn 89.41176470588236% 3.529411764705881%)'),
	test(Color.fromString('#e4f0f680' ).toString(ColorSpace.HSL), 'hsl(0.5555555555555557turn 50% 92.94117647058823% / 0.5019607843137255)'),
])
