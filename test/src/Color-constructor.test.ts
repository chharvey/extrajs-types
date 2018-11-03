import {Color} from '../../index'
import test from './test'


export default Promise.all([
	test(new Color(0.5 , 0.5, 0.5, 0.5).rgb.join(), '0.5,0.5,0.5,0.5'),
	test(new Color(0.25, 0.5, 1       ).rgb.join(), '0.25,0.5,1,1'),
	test(new Color(                   ).rgb.join(), '0,0,0,0'),
])
