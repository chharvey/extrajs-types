import {Color} from '../../index'
import test from './test'


export default Promise.all([
	test(new Color(0.25, 0.5, 1       ).toString(), '#4080ff'),
	test(new Color(0.25, 0.5, 1       ).toString(Color.Space.HWB), 'hwb(220 0.25 0)'),
	test(new Color(0.5 , 0.5, 0.5, 0.5).toString(Color.Space.HWB), 'hwb(0 0.5 0.5 / 0.5)'),
	test(new Color(                   ).toString(Color.Space.HWB), 'hwb(0 0 1 / 0)'),
	test(new Color(0.5 , 0.1, 0.9     ).toString(Color.Space.HSL), 'hsl(270 0.8 0.5)'),
])
